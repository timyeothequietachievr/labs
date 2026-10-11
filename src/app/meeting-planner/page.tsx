import type { Metadata } from "next";
import { MeetingPlanner } from "@/components/meeting-planner/MeetingPlanner";

export const metadata: Metadata = {
  title: "Meeting Planner · Quiet Achiever Labs",
  description:
    "Find the best overlapping meeting time across cities, anchored to your master city, with daylight-saving change notes.",
};

export default function MeetingPlannerPage() {
  return <MeetingPlanner />;
}
