/**
 * Profil-Helfer (Client-SDK, läuft unter der Login-Session — kein API-Key nötig).
 *
 * Die `profiles`-Collection hat kein userId-Feld → wir nutzen die Account-ID
 * als Dokument-ID (getDocument(profiles, user.$id)). Das macht das Mapping
 * Account ↔ Profil eindeutig und stabil, auch wenn sich der Anzeigename ändert.
 */
import { Permission, Role } from "appwrite";
import { databases, DB_ID, COL_PROFILES } from "./appwrite";
import type { AuthUser } from "@/components/AuthProvider";

export interface Profile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function map(d: any): Profile {
  return {
    id: d.$id,
    username: d.username ?? "",
    displayName: d.displayName ?? "",
    bio: d.bio ?? "",
    avatarUrl: d.avatarUrl ?? "",
  };
}

export async function getProfileById(id: string): Promise<Profile | null> {
  try {
    return map(await databases().getDocument(DB_ID, COL_PROFILES, id));
  } catch {
    return null;
  }
}

/** Speichert Bio/Anzeigename fürs eigene Profil (erstellt das Dokument bei Bedarf). */
export async function saveMyProfile(
  user: AuthUser,
  fields: { bio: string; displayName: string; avatarUrl?: string },
): Promise<Profile> {
  const perms = [
    Permission.read(Role.any()),
    Permission.update(Role.user(user.$id)),
    Permission.delete(Role.user(user.$id)),
  ];
  const data = {
    username: user.name || `user-${user.$id.slice(-6)}`,
    displayName: fields.displayName,
    bio: fields.bio,
    avatarUrl: fields.avatarUrl ?? "",
  };

  // Erst updaten; existiert das Dokument noch nicht (404), anlegen.
  try {
    return map(await databases().updateDocument(DB_ID, COL_PROFILES, user.$id, data));
  } catch (e) {
    const code = (e as { code?: number })?.code;
    if (code !== 404) {
      // z. B. username-Kollision (unique) → mit eindeutigem Suffix erneut versuchen
      return retryWithSuffixedUsername(user, data, perms, "update");
    }
  }
  try {
    return map(await databases().createDocument(DB_ID, COL_PROFILES, user.$id, data, perms));
  } catch {
    return retryWithSuffixedUsername(user, data, perms, "create");
  }
}

async function retryWithSuffixedUsername(
  user: AuthUser,
  data: { username: string; displayName: string; bio: string; avatarUrl: string },
  perms: string[],
  mode: "create" | "update",
): Promise<Profile> {
  const uniq = { ...data, username: `${data.username}-${user.$id.slice(-4)}` };
  if (mode === "update") {
    return map(await databases().updateDocument(DB_ID, COL_PROFILES, user.$id, uniq));
  }
  return map(await databases().createDocument(DB_ID, COL_PROFILES, user.$id, uniq, perms));
}
