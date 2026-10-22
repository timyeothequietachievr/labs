import { redirect } from "next/navigation";
import { getSession } from "./auth";

export async function requireCoachPage() {
  const session = await getSession();
  if (!session) redirect("/job-search/login");
  return session;
}
