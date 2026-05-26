/**
 * Anonymous saved-event store in localStorage. No accounts, no sync —
 * the next step would be account-based sync, but localStorage is the
 * right default for v1.
 */

const KEY = "tro:saved:v1";

export type SavedSet = Set<string>;

export function readSaved(): SavedSet {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : []);
  } catch {
    return new Set();
  }
}

function writeSaved(set: SavedSet) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...set]));
    window.dispatchEvent(new CustomEvent("tro:saved-changed"));
  } catch {
    // Quota or private-mode: nothing useful we can do.
  }
}

export function toggleSaved(id: string): boolean {
  const set = readSaved();
  const has = set.has(id);
  if (has) set.delete(id);
  else set.add(id);
  writeSaved(set);
  return !has; // returns the new state
}

export function isSaved(id: string): boolean {
  return readSaved().has(id);
}

/** Subscribe to changes (same tab via custom event, other tabs via storage event). */
export function onSavedChange(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const onCustom = () => handler();
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) handler();
  };
  window.addEventListener("tro:saved-changed", onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener("tro:saved-changed", onCustom);
    window.removeEventListener("storage", onStorage);
  };
}
