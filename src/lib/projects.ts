export type Project = {
  name: string;
  platform: string;
  description: string;
  href?: string;
  hrefLabel?: string;
};

export const projects: Project[] = [
  {
    name: "Web Job Search",
    platform: "Web app · Coach",
    description:
      "Multi-client job radar for Quiet Achiever coaching — discover roles, score every client, allocate into Notion Opportunities.",
    href: "/job-search",
    hrefLabel: "Open Web Job Search",
  },
  {
    name: "Meeting Planner",
    platform: "Web app",
    description:
      "Cross-timezone meeting finder with Sydney as master city (changeable), row highlight, and daylight-saving change callouts.",
    href: "https://meetingdatetime.thequietachievr.com",
    hrefLabel: "meetingdatetime.thequietachievr.com",
  },
  {
    name: "Wheel of Names",
    platform: "Web app",
    description:
      "A branded giveaway wheel with Master Class signup — spin names, pick a winner, keep the vibe on-brand for The Quiet Achiever.",
    href: "https://wheelofnames.thequietachievr.com",
    hrefLabel: "wheelofnames.thequietachievr.com",
  },
  {
    name: "Annotator",
    platform: "Chrome extension · Beta",
    description:
      "Highlight text on any page, tag feedback, add comments, capture short audio notes, and share a read-receipt snapshot. Beta install: download the zip, unzip it, then Load unpacked in Chrome Developer mode.",
    href: "/downloads/annotator-beta.zip",
    hrefLabel: "Download beta (zip)",
  },
  {
    name: "Rain Radar",
    platform: "macOS app",
    description:
      "Bureau of Meteorology rain radar in your menu bar. Pick a station, watch the loop, and check the sky without opening a browser tab.",
  },
  {
    name: "Print Ship Label",
    platform: "Web app",
    description:
      "Upload a shipping-label PDF, pick a sticker slot on a 4-up A4 sheet, and download a print-ready layout at actual size.",
    href: "https://printshiplabel.thequietachievr.com",
    hrefLabel: "printshiplabel.thequietachievr.com",
  },
  {
    name: "Prompt My Notch",
    platform: "macOS app",
    description:
      "A notch teleprompter invisible to screen share. Import speaker notes from Google Slides or Keynote, then scroll with your voice.",
    href: "https://www.promptmynotch.com",
    hrefLabel: "promptmynotch.com",
  },
  {
    name: "CopyPaste",
    platform: "macOS app",
    description:
      "A minimal plain-text editor inspired by BBEdit. Multi-document sidebar, status bar counts, and the basics without the bloat.",
  },
];
