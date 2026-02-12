import { draftStorageKey } from "../config.js";

export function readDraft() {
    try {
        const raw = localStorage.getItem(draftStorageKey);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function writeDraft(payload) {
    localStorage.setItem(draftStorageKey, JSON.stringify(payload));
}

export function clearDraft() {
    localStorage.removeItem(draftStorageKey);
}
