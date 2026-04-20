/**
 * attributeNotes.ts
 *
 * Store for persisting developer notes on collection attributes/columns.
 * Notes are stored in localStorage because the Appwrite API does not currently
 * expose a `notes` field on attribute objects. This is a console-only feature.
 *
 * Storage key format:  appwrite_attribute_notes
 * Data shape:          Record<string, string>
 *   where key = `${databaseId}/${collectionId}/${attributeKey}`
 *   and value = the note text
 *
 * Issue: https://github.com/appwrite/appwrite/issues/11945
 */

import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const STORAGE_KEY = 'appwrite_attribute_notes';

type NotesMap = Record<string, string>;

/**
 * Build the compound key used to look up a note.
 */
export function buildNoteKey(
    databaseId: string,
    collectionId: string,
    attributeKey: string
): string {
    return `${databaseId}/${collectionId}/${attributeKey}`;
}

/**
 * Load notes map from localStorage, returning an empty object on any error.
 */
function isNotesMap(value: unknown): value is NotesMap {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function loadFromStorage(): NotesMap {
    if (!browser) return {};
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return {};
        const parsed: unknown = JSON.parse(raw);
        return isNotesMap(parsed) ? parsed : {};
    } catch {
        return {};
    }
}

/**
 * Persist notes map to localStorage.
 */
function saveToStorage(notes: NotesMap): void {
    if (!browser) return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch {
        // Silently ignore storage errors (e.g. private browsing quota)
    }
}

function createAttributeNotesStore() {
    const { subscribe, set, update } = writable<NotesMap>(loadFromStorage());

    return {
        subscribe,

        /**
         * Get the note for a specific attribute.
         */
        getNote(databaseId: string, collectionId: string, attributeKey: string): string {
            const notes = loadFromStorage();
            return notes[buildNoteKey(databaseId, collectionId, attributeKey)] ?? '';
        },

        /**
         * Save or clear a note for a specific attribute.
         */
        setNote(
            databaseId: string,
            collectionId: string,
            attributeKey: string,
            note: string
        ): void {
            update((notes) => {
                const key = buildNoteKey(databaseId, collectionId, attributeKey);
                const updated = { ...notes };
                
                const trimmedNote = note.trim();

                if (trimmedNote) {
                    updated[key] = trimmedNote;
                } else {
                    delete updated[key];
                }
                saveToStorage(updated);
                return updated;
            });
        },

        /**
         * Delete a note for a specific attribute (e.g. when attribute is deleted).
         */
        deleteNote(databaseId: string, collectionId: string, attributeKey: string): void {
            update((notes) => {
                const key = buildNoteKey(databaseId, collectionId, attributeKey);
                const updated = { ...notes };
                delete updated[key];
                saveToStorage(updated);
                return updated;
            });
        },

        /**
         * Delete all notes for a collection (e.g. when collection is deleted).
         */
        deleteCollectionNotes(databaseId: string, collectionId: string): void {
            update((notes) => {
                const prefix = `${databaseId}/${collectionId}/`;
                const updated = Object.fromEntries(
                    Object.entries(notes).filter(([k]) => !k.startsWith(prefix))
                );
                saveToStorage(updated);
                return updated;
            });
        },

        /** Re-sync from localStorage (useful after external changes). */
        reload(): void {
            set(loadFromStorage());
        }
    };
}

export const attributeNotes = createAttributeNotesStore();
