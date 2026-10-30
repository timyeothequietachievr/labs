/**
 * Standing discovery sources for Job Discovery Bot / shared crawl.
 * Slack channel IDs span multiple workspaces — Cursor MCP is one workspace at a time;
 * Job Discovery Bot needs its own Slack access to each community.
 */
export type JobDiscoverySource = {
  id: string;
  kind: "trueup" | "linkedin_public" | "slack_channel" | "career_site" | "other";
  label: string;
  community?: string;
  /** Slack channel ID (C…) when kind is slack_channel */
  channelId?: string;
  url?: string;
  notes?: string;
  priority: number;
};

export const JOB_DISCOVERY_SOURCES: JobDiscoverySource[] = [
  {
    id: "trueup",
    kind: "trueup",
    label: "TrueUp",
    url: "https://www.trueup.io/",
    priority: 1,
    notes: "Primary ATS aggregator. Bot computer TrueUp login OK.",
  },
  {
    id: "linkedin_public",
    kind: "linkedin_public",
    label: "LinkedIn jobs (public / alerts)",
    priority: 2,
    notes: "Never Tim Yeo’s LinkedIn login.",
  },
  {
    id: "leadingdesign-jobs-leadership",
    kind: "slack_channel",
    label: "#jobs-leadership",
    community: "Leading Design",
    channelId: "C4G08N8DN",
    url: "https://leadingdesign.slack.com/archives/C4G08N8DN",
    priority: 3,
    notes: "Leadership / HoD / Director / VP design roles.",
  },
  {
    id: "leadingdesign-jobs-ic",
    kind: "slack_channel",
    label: "#jobs-ic",
    community: "Leading Design",
    channelId: "CT8EQSMD3",
    url: "https://leadingdesign.slack.com/archives/CT8EQSMD3",
    priority: 3,
    notes: "IC Staff/Principal/Lead design roles.",
  },
  {
    id: "aussiedesigners-jobs",
    kind: "slack_channel",
    label: "#jobs",
    community: "Aussie Designers",
    channelId: "C2B39S1K3",
    url: "https://aussiedesigners.slack.com/archives/C2B39S1K3",
    priority: 3,
    notes: "AU design roles. Separate Slack workspace from Leading Design.",
  },
];

export function listDiscoverySources() {
  return [...JOB_DISCOVERY_SOURCES].sort(
    (a, b) => a.priority - b.priority || a.label.localeCompare(b.label),
  );
}
