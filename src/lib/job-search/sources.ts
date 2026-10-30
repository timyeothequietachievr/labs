/**
 * Standing discovery sources for Job Discovery Bot / shared crawl.
 * Sourced from Notion: "20261030 - Job search links sourses repositories"
 * Slack channel IDs span multiple workspaces — Cursor MCP is one workspace at a time;
 * Job Discovery Bot needs its own Slack access to each community.
 */
export type JobDiscoverySource = {
  id: string;
  kind:
    | "trueup"
    | "job_board"
    | "linkedin_public"
    | "linkedin_person_feed"
    | "slack_channel"
    | "career_site"
    | "other";
  label: string;
  community?: string;
  /** Slack channel ID (C…) when kind is slack_channel */
  channelId?: string;
  /** Person name when kind is linkedin_person_feed */
  personName?: string;
  url?: string;
  notes?: string;
  /** Human login / workspace access the bot or coach may need */
  loginHint?: string;
  priority: number;
};

export const JOB_DISCOVERY_SOURCES: JobDiscoverySource[] = [
  // --- Websites / boards ---
  {
    id: "trueup",
    kind: "trueup",
    label: "TrueUp",
    url: "https://www.trueup.io/",
    priority: 1,
    notes: "Primary ATS aggregator.",
    loginHint: "Bot computer TrueUp login OK.",
  },
  {
    id: "jobright",
    kind: "job_board",
    label: "Jobright",
    url: "https://jobright.ai/",
    priority: 2,
    notes: "AI job search copilot / board.",
    loginHint: "May need account login on bot computer if gated.",
  },
  {
    id: "jobsangel",
    kind: "job_board",
    label: "JobsAngel",
    url: "https://jobsangel.com/",
    priority: 2,
    notes: "Job board.",
    loginHint: "May need account login on bot computer if gated.",
  },
  {
    id: "nofluffjobs",
    kind: "job_board",
    label: "No Fluff Jobs (PL)",
    url: "https://nofluffjobs.com/pl",
    priority: 5,
    notes: "Poland board (Mateusz rec). Design/tech roles.",
  },
  {
    id: "justjoinit",
    kind: "job_board",
    label: "Just Join IT",
    url: "https://justjoin.it/",
    priority: 5,
    notes: "Poland IT board (Mateusz rec).",
  },
  {
    id: "pracuj",
    kind: "job_board",
    label: "Pracuj.pl",
    url: "https://www.pracuj.pl/",
    priority: 5,
    notes: "Poland jobs (Mateusz rec).",
  },
  {
    id: "linkedin_public",
    kind: "linkedin_public",
    label: "LinkedIn jobs (public / alerts)",
    priority: 2,
    notes: "Never Tim Yeo’s LinkedIn login.",
  },

  // --- Slack job boards ---
  {
    id: "leadingdesign-jobs-leadership",
    kind: "slack_channel",
    label: "#jobs-leadership",
    community: "Leading Design",
    channelId: "C4G08N8DN",
    url: "https://leadingdesign.slack.com/archives/C4G08N8DN",
    priority: 3,
    notes: "Leadership / HoD / Director / VP design roles.",
    loginHint: "Slack workspace: Leading Design",
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
    loginHint: "Slack workspace: Leading Design",
  },
  {
    id: "aussiedesigners-jobs",
    kind: "slack_channel",
    label: "#jobs (hiring)",
    community: "Aussie Designers",
    channelId: "C2B39S1K3",
    url: "https://aussiedesigners.slack.com/archives/C2B39S1K3",
    priority: 3,
    notes: "AU design roles.",
    loginHint: "Slack workspace: Aussie Designers (separate from Leading Design)",
  },
  {
    id: "researchops-jobs",
    kind: "slack_channel",
    label: "#jobs",
    community: "Research Ops",
    channelId: "C9NKCC9A7",
    url: "https://researchops-community.slack.com/archives/C9NKCC9A7",
    priority: 3,
    notes: "Research Ops / UX research roles.",
    loginHint: "Slack workspace: Research Ops Community",
  },
  {
    id: "contentux-jobs-gigs",
    kind: "slack_channel",
    label: "#jobs-and-gigs",
    community: "Content + UX",
    channelId: "C0755T3B3",
    url: "https://content-ux.slack.com/archives/C0755T3B3",
    priority: 3,
    notes: "Content design / UX writing jobs and gigs.",
    loginHint: "Slack workspace: Content + UX",
  },
  {
    id: "designleaders-jobs",
    kind: "slack_channel",
    label: "#jobs",
    community: "Design Leaders",
    channelId: "CUMSS8010",
    url: "https://design-leaders-team.slack.com/archives/CUMSS8010",
    priority: 3,
    notes: "Design leadership roles.",
    loginHint: "Slack workspace: Design Leaders",
  },
  {
    id: "adplist-job-opportunities",
    kind: "slack_channel",
    label: "#job-opportunities",
    community: "ADPList",
    channelId: "C05D67738P4",
    url: "https://adplist-mentor.slack.com/archives/C05D67738P4",
    priority: 3,
    notes: "ADPList mentor community job opportunities.",
    loginHint: "Slack workspace: ADPList Mentor",
  },
  {
    id: "designsystems-connect-jobs",
    kind: "slack_channel",
    label: "#connect-jobs",
    community: "Design Systems",
    channelId: "C0N8H78G0",
    url: "https://design-systems.slack.com/archives/C0N8H78G0",
    priority: 3,
    notes: "Design systems roles.",
    loginHint: "Slack workspace: Design Systems",
  },
  {
    id: "lenny-job-openings",
    kind: "slack_channel",
    label: "#job-openings",
    community: "Lenny’s Newsletter",
    channelId: "C012Y8DDS4F",
    url: "https://lennysnewsletter.slack.com/archives/C012Y8DDS4F",
    priority: 3,
    notes: "Product / design openings from Lenny’s community.",
    loginHint: "Slack workspace: Lenny’s Newsletter",
  },

  // --- LinkedIn people ---
  {
    id: "linkedin-jcolman",
    kind: "linkedin_person_feed",
    label: "Jonathan Coleman — LinkedIn posts",
    personName: "Jonathan Coleman",
    url: "https://www.linkedin.com/in/jcolman/",
    priority: 4,
    notes:
      "Content designer / content writer openings he shares. Public/profile surfaces only.",
    loginHint: "Never Tim Yeo’s LinkedIn login.",
  },
];

export function listDiscoverySources() {
  return [...JOB_DISCOVERY_SOURCES].sort(
    (a, b) => a.priority - b.priority || a.label.localeCompare(b.label),
  );
}
