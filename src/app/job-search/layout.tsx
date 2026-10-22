import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Web Job Search · Quiet Achiever Labs",
  description:
    "Multi-client job radar for Quiet Achiever coaching — discover, match, allocate.",
};

export default function JobSearchLayout({ children }: { children: ReactNode }) {
  return children;
}
