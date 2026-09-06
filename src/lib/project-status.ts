import { addDays, compareISODate, todayISO } from "./dates";
import type { ProjectStatus, RaidItem, RaidSeverity } from "./types";

/** Days before end_date when incomplete work becomes at_risk. */
export const AT_RISK_END_WINDOW_DAYS = 14;

/** Open = not closed (open | in_progress | escalated). */
export function isOpenRaid(item: Pick<RaidItem, "status">): boolean {
  return item.status !== "closed";
}

function isHighOrCritical(severity: RaidSeverity): boolean {
  return severity === "high" || severity === "critical";
}

export type ProjectStatusInputs = {
  endDate: string;
  percentComplete: number;
  openRaid: Pick<RaidItem, "type" | "status" | "severity">[];
  /** ISO date for "today"; defaults to local calendar today. */
  today?: string;
};

/**
 * Schedule- and RAID-aware project status (computed-only; no manual override in v1).
 *
 * Off track when any of:
 * 1. end_date < today AND overall % complete < 100
 * 2. any open RAID with status escalated
 * 3. any open issue with severity critical
 * 4. two or more open RAID items with severity high or critical
 *
 * At risk when not off track and any of:
 * 1. end_date within AT_RISK_END_WINDOW_DAYS (inclusive) AND % complete < 100
 * 2. any open RAID (risk or issue) with severity high or critical
 *
 * On track otherwise.
 */
export function computeProjectStatus(input: ProjectStatusInputs): ProjectStatus {
  const today = input.today ?? todayISO();
  const incomplete = input.percentComplete < 100;
  const open = input.openRaid.filter(isOpenRaid);

  const overdue = compareISODate(input.endDate, today) < 0 && incomplete;
  const hasEscalated = open.some((item) => item.status === "escalated");
  const hasCriticalIssue = open.some(
    (item) => item.type === "issue" && item.severity === "critical"
  );
  const highOrCriticalCount = open.filter((item) =>
    isHighOrCritical(item.severity)
  ).length;

  if (overdue || hasEscalated || hasCriticalIssue || highOrCriticalCount >= 2) {
    return "off_track";
  }

  const endSoon =
    compareISODate(input.endDate, today) >= 0 &&
    compareISODate(input.endDate, addDays(today, AT_RISK_END_WINDOW_DAYS)) <= 0 &&
    incomplete;
  const hasHighOrCritical = highOrCriticalCount >= 1;

  if (endSoon || hasHighOrCritical) {
    return "at_risk";
  }

  return "on_track";
}
