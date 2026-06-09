// API Configuration for Mission Control Dashboard
// Switch between local API routes and Cloudflare Worker

const USE_WORKER = process.env.NEXT_PUBLIC_USE_WORKER === "true";
const WORKER_URL = process.env.NEXT_PUBLIC_WORKER_URL || "https://openclaw-api.digitalartifacts.studio";

export function getApiUrl(path: string): string {
  if (USE_WORKER) {
    return `${WORKER_URL}${path}`;
  }
  return path; // Local API routes
}

export const API_CONFIG = {
  useWorker: USE_WORKER,
  workerUrl: WORKER_URL,
};
