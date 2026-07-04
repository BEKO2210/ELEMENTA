/**
 * Appwrite Web SDK client for Elementa.
 *
 * Endpoint + project come from env vars so we never hardcode secrets:
 *   NEXT_PUBLIC_APPWRITE_ENDPOINT  (e.g. https://appwrite.it-handwerk-stuttgart.de/v1)
 *   NEXT_PUBLIC_APPWRITE_PROJECT   (project id)
 *
 * Frontend (ui.it-handwerk-stuttgart.de) and Appwrite share the apex domain
 * it-handwerk-stuttgart.de, so the session cookie works (no 3rd-party-cookie block).
 */
import { Client, Account, Databases, Storage } from "appwrite";

export const APPWRITE_ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ??
  "https://appwrite.it-handwerk-stuttgart.de/v1";
export const APPWRITE_PROJECT = process.env.NEXT_PUBLIC_APPWRITE_PROJECT ?? "";

export const DB_ID = "marketplace";
export const COL_COMPONENTS = "components";
export const COL_PROFILES = "profiles";
export const COL_LIKES = "likes";
export const COL_COMMENTS = "comments";
export const COL_COMMENT_HELPFUL = "comment_helpful";
export const COL_FAVORITES = "favorites";
export const COL_REPORTS = "reports";
export const BUCKET_AVATARS = "avatars";

export function createClient(): Client {
  return new Client().setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT);
}

let _client: Client | null = null;
function client(): Client {
  if (!_client) _client = createClient();
  return _client;
}

export const account = () => new Account(client());
export const databases = () => new Databases(client());
export const storage = () => new Storage(client());

/** Öffentliche View-URL einer Datei (z. B. Avatar) im gegebenen Bucket. */
export function fileViewUrl(bucketId: string, fileId: string): string {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${bucketId}/files/${fileId}/view?project=${APPWRITE_PROJECT}`;
}
