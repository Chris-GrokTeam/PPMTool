export type OutlineRow = {
  id: number;
  parent_id: number | null;
};

export type OutlineBlock = {
  head: OutlineRow;
  children: OutlineRow[];
};

export function toBlocks(rows: OutlineRow[]): OutlineBlock[] {
  const children = new Map<number, OutlineRow[]>();
  const heads: OutlineRow[] = [];
  const headIds = new Set<number>();

  for (const row of rows) {
    if (row.parent_id == null) {
      heads.push({ id: row.id, parent_id: null });
      headIds.add(row.id);
    } else {
      const list = children.get(row.parent_id) ?? [];
      list.push({ id: row.id, parent_id: row.parent_id });
      children.set(row.parent_id, list);
    }
  }

  for (const row of rows) {
    if (row.parent_id != null && !headIds.has(row.parent_id) && !headIds.has(row.id)) {
      heads.push({ id: row.id, parent_id: null });
      headIds.add(row.id);
    }
  }

  return heads.map((head) => ({
    head,
    children: (children.get(head.id) ?? []).map((child) => ({
      id: child.id,
      parent_id: head.id,
    })),
  }));
}

export function flattenBlocks(blocks: OutlineBlock[]): OutlineRow[] {
  const out: OutlineRow[] = [];
  for (const block of blocks) {
    out.push({ id: block.head.id, parent_id: null });
    for (const child of block.children) {
      out.push({ id: child.id, parent_id: block.head.id });
    }
  }
  return out;
}

export function outlineNumbers(rows: OutlineRow[]): Record<number, string> {
  const numbers: Record<number, string> = {};
  let top = 0;
  const childCount = new Map<number, number>();
  for (const row of rows) {
    if (row.parent_id == null) {
      top += 1;
      numbers[row.id] = String(top);
    } else {
      const n = (childCount.get(row.parent_id) ?? 0) + 1;
      childCount.set(row.parent_id, n);
      const parentNum = numbers[row.parent_id] ?? "?";
      numbers[row.id] = `${parentNum}.${n}`;
    }
  }
  return numbers;
}

export function blockIds(rows: OutlineRow[], id: number): number[] {
  const task = rows.find((row) => row.id === id);
  if (!task) return [];
  if (task.parent_id != null) return [id];
  return [id, ...rows.filter((row) => row.parent_id === id).map((row) => row.id)];
}

export function hasChildren(rows: OutlineRow[], id: number): boolean {
  return rows.some((row) => row.parent_id === id);
}

export function canIndent(rows: OutlineRow[], id: number): boolean {
  const index = rows.findIndex((row) => row.id === id);
  if (index <= 0) return false;
  const task = rows[index];
  if (task.parent_id != null) return false;
  if (hasChildren(rows, id)) return false;
  return true;
}

export function canOutdent(rows: OutlineRow[], id: number): boolean {
  const task = rows.find((row) => row.id === id);
  return task?.parent_id != null;
}

export function indentRows(rows: OutlineRow[], id: number): OutlineRow[] | null {
  if (!canIndent(rows, id)) return null;
  const index = rows.findIndex((row) => row.id === id);
  const preceding = rows[index - 1];
  const parentId = preceding.parent_id ?? preceding.id;
  const next = rows.filter((row) => row.id !== id);
  const pred = next.findIndex((row) => row.id === preceding.id);
  next.splice(pred + 1, 0, { id, parent_id: parentId });
  return flattenBlocks(toBlocks(next));
}

export function outdentRows(rows: OutlineRow[], id: number): OutlineRow[] | null {
  if (!canOutdent(rows, id)) return null;
  const task = rows.find((row) => row.id === id);
  if (!task?.parent_id) return null;
  const parentId = task.parent_id;
  const without = rows.filter((row) => row.id !== id);
  let lastIdx = -1;
  for (let i = 0; i < without.length; i++) {
    const row = without[i];
    if (row.id === parentId || row.parent_id === parentId) lastIdx = i;
  }
  if (lastIdx < 0) {
    const orig = rows.findIndex((row) => row.id === id);
    without.splice(Math.min(orig, without.length), 0, { id, parent_id: null });
  } else {
    without.splice(lastIdx + 1, 0, { id, parent_id: null });
  }
  return flattenBlocks(toBlocks(without));
}

export function reorderRows(
  rows: OutlineRow[],
  draggedId: number,
  beforeId: number | null
): OutlineRow[] | null {
  const dragged = rows.find((row) => row.id === draggedId);
  if (!dragged) return null;
  const blocks = toBlocks(rows);

  if (dragged.parent_id == null) {
    const from = blocks.findIndex((block) => block.head.id === draggedId);
    if (from < 0) return null;
    const block = blocks[from];
    const rest = blocks.filter((_, index) => index !== from);
    let to: number;
    if (beforeId == null) {
      to = rest.length;
    } else {
      const before = rows.find((row) => row.id === beforeId);
      if (!before) return null;
      const beforeHeadId = before.parent_id ?? before.id;
      if (beforeHeadId === draggedId) return flattenBlocks(blocks);
      to = rest.findIndex((item) => item.head.id === beforeHeadId);
      if (to < 0) return null;
    }
    rest.splice(to, 0, block);
    return flattenBlocks(rest);
  }

  const parentId = dragged.parent_id;
  const blockIndex = blocks.findIndex((block) => block.head.id === parentId);
  if (blockIndex < 0) return null;
  const block = blocks[blockIndex];
  const from = block.children.findIndex((child) => child.id === draggedId);
  if (from < 0) return null;
  const child = block.children[from];
  const siblings = block.children.filter((item) => item.id !== draggedId);
  let to: number;
  if (beforeId == null) {
    to = siblings.length;
  } else if (beforeId === parentId) {
    to = 0;
  } else {
    const before = rows.find((row) => row.id === beforeId);
    if (!before || before.parent_id !== parentId) return null;
    to = siblings.findIndex((item) => item.id === beforeId);
    if (to < 0) return null;
  }
  siblings.splice(to, 0, child);
  const next = blocks.map((item, index) =>
    index === blockIndex ? { ...item, children: siblings } : item
  );
  return flattenBlocks(next);
}

export function dropBeforeId(
  rows: OutlineRow[],
  draggedId: number,
  overId: number,
  position: "before" | "after"
): number | null | undefined {
  const dragged = rows.find((row) => row.id === draggedId);
  const over = rows.find((row) => row.id === overId);
  if (!dragged || !over) return undefined;

  if (dragged.parent_id == null) {
    const overHead = over.parent_id ?? over.id;
    if (overHead === dragged.id) return undefined;
    const others = toBlocks(rows).filter((block) => block.head.id !== dragged.id);
    const overIndex = others.findIndex((block) => block.head.id === overHead);
    if (overIndex < 0) return undefined;
    if (position === "before") return others[overIndex].head.id;
    return overIndex + 1 < others.length ? others[overIndex + 1].head.id : null;
  }

  const parentId = dragged.parent_id;
  const block = toBlocks(rows).find((item) => item.head.id === parentId);
  if (!block) return undefined;
  const siblings = block.children.filter((child) => child.id !== draggedId);

  if (over.id === parentId) {
    if (position === "before") return undefined;
    return siblings[0]?.id ?? null;
  }
  if (over.parent_id !== parentId) return undefined;
  const overIndex = siblings.findIndex((child) => child.id === over.id);
  if (overIndex < 0) return undefined;
  if (position === "before") return siblings[overIndex].id;
  return overIndex + 1 < siblings.length ? siblings[overIndex + 1].id : null;
}

export function dropEdge(
  rows: OutlineRow[],
  draggedId: number,
  beforeId: number | null
): { taskId: number; where: "before" | "after" } | null {
  const dragged = rows.find((row) => row.id === draggedId);
  if (!dragged) return null;
  const blocks = toBlocks(rows);

  if (dragged.parent_id == null) {
    const others = blocks.filter((block) => block.head.id !== dragged.id);
    if (others.length === 0) return null;
    if (beforeId == null) {
      const last = others[others.length - 1];
      const lastRow = last.children[last.children.length - 1] ?? last.head;
      return { taskId: lastRow.id, where: "after" };
    }
    return { taskId: beforeId, where: "before" };
  }

  const block = blocks.find((item) => item.head.id === dragged.parent_id);
  if (!block) return null;
  const others = block.children.filter((child) => child.id !== draggedId);
  if (beforeId == null) {
    if (others.length === 0) return { taskId: block.head.id, where: "after" };
    return { taskId: others[others.length - 1].id, where: "after" };
  }
  return { taskId: beforeId, where: "before" };
}
