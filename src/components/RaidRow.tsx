"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { personLabel } from "@/lib/people";
import {
  RAID_SEVERITIES,
  raidSeverityLabel,
  type RaidSeverity,
} from "@/lib/raid-severity";
import { RAID_STATUSES, raidStatusLabel, type RaidStatus } from "@/lib/raid-status";
import type { RaidItem } from "@/lib/types";

export function RaidRow({
  projectId,
  item,
}: {
  projectId: number;
  item: RaidItem;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description);
  const [status, setStatus] = useState<RaidStatus>(item.status);
  const [dueDate, setDueDate] = useState(item.due_date);
  const [severity, setSeverity] = useState<RaidSeverity>(item.severity);

  useEffect(() => {
    setTitle(item.title);
    setDescription(item.description);
    setStatus(item.status);
    setDueDate(item.due_date);
    setSeverity(item.severity);
  }, [item.title, item.description, item.status, item.due_date, item.severity]);

  async function persist(next: {
    title?: string;
    description?: string;
    status?: RaidStatus;
    dueDate?: string;
    severity?: RaidSeverity;
  }) {
    const payload = {
      id: item.id,
      title: (next.title ?? title).trim(),
      description: (next.description ?? description).trim(),
      status: next.status ?? status,
      dueDate: next.dueDate ?? dueDate,
      severity: next.severity ?? severity,
    };
    if (!payload.title || !payload.description || !payload.dueDate) return;
    const response = await fetch("/api/raid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.ok) router.refresh();
  }

  const closed = status === "closed";

  return (
    <tr className={`border-t border-slate-100 align-top ${closed ? "bg-slate-50 text-slate-400" : ""}`}>
      <td className={`px-3 py-2 capitalize ${closed ? "text-slate-400" : ""}`}>{item.type}</td>
      <td className="px-3 py-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() => {
            if (title.trim() && title.trim() !== item.title) void persist({ title: title.trim() });
          }}
          className={`w-full rounded border border-transparent bg-transparent px-1 py-0.5 font-medium outline-hidden hover:border-slate-300 focus:border-sky-600 ${
            closed ? "text-slate-400" : "text-slate-900"
          }`}
          aria-label="Title"
        />
        <Link
          href={`/projects/${projectId}/raid/${item.id}`}
          className={`mt-0.5 inline-block text-xs hover:underline ${closed ? "text-slate-400" : "text-sky-800"}`}
        >
          Comments
        </Link>
      </td>
      <td className="px-3 py-2">
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          onBlur={() => {
            if (description.trim() && description.trim() !== item.description) {
              void persist({ description: description.trim() });
            }
          }}
          rows={2}
          className={`w-full resize-y rounded border border-transparent bg-transparent px-1 py-0.5 outline-hidden hover:border-slate-300 focus:border-sky-600 ${
            closed ? "text-slate-400" : "text-slate-700"
          }`}
          aria-label="Description"
        />
      </td>
      <td className={`px-3 py-2 text-xs leading-snug ${closed ? "text-slate-400" : "text-slate-700"}`}>
        {personLabel(item.assigned_name, item.assigned_role)}
      </td>
      <td className="px-3 py-2">
        <input
          type="date"
          value={dueDate}
          onChange={(event) => {
            const next = event.target.value;
            setDueDate(next);
            if (next) void persist({ dueDate: next });
          }}
          className={`rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-hidden focus:border-sky-600 ${
            closed ? "border-slate-200 bg-slate-100 text-slate-500" : "text-slate-800"
          }`}
          aria-label="Due"
        />
      </td>
      <td className="px-3 py-2">
        <select
          value={severity}
          onChange={(event) => {
            const next = event.target.value as RaidSeverity;
            setSeverity(next);
            void persist({ severity: next });
          }}
          className={`rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-hidden focus:border-sky-600 ${
            closed
              ? "border-slate-200 bg-slate-100 text-slate-500"
              : severity === "critical"
                ? "border-red-300 bg-red-50 text-red-900"
                : severity === "high"
                  ? "border-amber-300 bg-amber-50 text-amber-950"
                  : "text-slate-800"
          }`}
          aria-label="Severity"
        >
          {RAID_SEVERITIES.map((value) => (
            <option key={value} value={value}>
              {raidSeverityLabel[value]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <select
          value={status}
          onChange={(event) => {
            const next = event.target.value as RaidStatus;
            setStatus(next);
            void persist({ status: next });
          }}
          className={`rounded border border-slate-200 bg-white px-2 py-1 text-xs outline-hidden focus:border-sky-600 ${
            closed ? "border-slate-200 bg-slate-100 text-slate-500" : "text-slate-800"
          }`}
          aria-label="Status"
        >
          {RAID_STATUSES.map((value) => (
            <option key={value} value={value}>
              {raidStatusLabel[value]}
            </option>
          ))}
        </select>
      </td>
    </tr>
  );
}
