export const RAID_STATUSES = ["open", "in_progress", "escalated", "closed"] as const;
export type RaidStatus = (typeof RAID_STATUSES)[number];

export const raidStatusLabel: Record<RaidStatus, string> = {
  open: "Open",
  in_progress: "In progress",
  escalated: "Escalated",
  closed: "Closed",
};

export function isRaidStatus(value: string): value is RaidStatus {
  return (RAID_STATUSES as readonly string[]).includes(value);
}
