export const RAID_SEVERITIES = ["low", "medium", "high", "critical"] as const;
export type RaidSeverity = (typeof RAID_SEVERITIES)[number];

export const raidSeverityLabel: Record<RaidSeverity, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
};

/** Higher number = more severe (for sort). */
export const raidSeverityRank: Record<RaidSeverity, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export function isRaidSeverity(value: string): value is RaidSeverity {
  return (RAID_SEVERITIES as readonly string[]).includes(value);
}
