import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE = "qa_job_search_session";
const MAX_AGE = 60 * 60 * 24 * 14; // 14 days

function secretKey() {
  const secret =
    process.env.JOB_SEARCH_AUTH_SECRET ||
    process.env.JOB_SEARCH_COACH_PASSWORD ||
    "dev-only-change-me";
  return new TextEncoder().encode(secret);
}

export function getCoachCredentials() {
  return {
    email: process.env.JOB_SEARCH_COACH_EMAIL || "tim@thequietachievr.com",
    password: process.env.JOB_SEARCH_COACH_PASSWORD || "changeme",
  };
}

export async function createSessionToken(email: string) {
  return new SignJWT({ email, role: "coach" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (payload.role !== "coach" || typeof payload.email !== "string") {
      return null;
    }
    return { email: payload.email };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireCoach() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export function verifyPassword(email: string, password: string) {
  const creds = getCoachCredentials();
  return (
    email.trim().toLowerCase() === creds.email.trim().toLowerCase() &&
    password === creds.password
  );
}
