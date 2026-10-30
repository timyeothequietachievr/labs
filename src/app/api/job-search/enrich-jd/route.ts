import { NextResponse } from "next/server";
import { getSession } from "@/lib/job-search/auth";
import { fetchJobDescriptionText, shouldEnrichJd } from "@/lib/job-search/enrich-jd";
import { getJob, listJobs, updateJobJd } from "@/lib/job-search/store";

/**
 * Coach-triggered: fetch full JD from canonical URLs for thin snippets.
 * POST {} → enrich all thin jobs; POST { jobId } → one job.
 */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const jobId = body.jobId ? String(body.jobId) : null;

  const targets = jobId
    ? [await getJob(jobId)].filter(Boolean)
    : (await listJobs()).filter(
        (j) => shouldEnrichJd(j.jdText) && j.canonicalUrl,
      );

  const updated: string[] = [];
  const failed: string[] = [];

  for (const job of targets) {
    if (!job?.canonicalUrl) continue;
    const text = await fetchJobDescriptionText(job.canonicalUrl);
    if (text && text.length > job.jdText.trim().length) {
      await updateJobJd(job.id, text);
      updated.push(job.id);
    } else {
      failed.push(job.id);
    }
  }

  return NextResponse.json({
    attempted: targets.length,
    updated: updated.length,
    failed: failed.length,
    updatedIds: updated,
  });
}
