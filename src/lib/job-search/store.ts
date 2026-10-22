import { useSupabaseStore } from "./supabase";
import * as local from "./store-local";
import * as sb from "./store-supabase";

export { hashJd } from "./hash";
export { readStore, writeStore } from "./store-local";

function api() {
  return useSupabaseStore() ? sb : local;
}

export async function listClients() {
  return api().listClients();
}

export async function getClient(id: string) {
  return api().getClient(id);
}

export async function upsertClient(
  ...args: Parameters<typeof local.upsertClient>
) {
  return api().upsertClient(...args);
}

export async function listJobs() {
  return api().listJobs();
}

export async function getJob(id: string) {
  return api().getJob(id);
}

export async function upsertJob(...args: Parameters<typeof local.upsertJob>) {
  return api().upsertJob(...args);
}

export async function listMatches(
  ...args: Parameters<typeof local.listMatches>
) {
  return api().listMatches(...args);
}

export async function upsertMatch(
  ...args: Parameters<typeof local.upsertMatch>
) {
  return api().upsertMatch(...args);
}

export async function updateMatchDecision(
  ...args: Parameters<typeof local.updateMatchDecision>
) {
  return api().updateMatchDecision(...args);
}

export async function createRun(...args: Parameters<typeof local.createRun>) {
  return api().createRun(...args);
}

export async function finishRun(...args: Parameters<typeof local.finishRun>) {
  return api().finishRun(...args);
}

export async function listRuns() {
  return api().listRuns();
}

export async function dashboardStats() {
  return api().dashboardStats();
}
