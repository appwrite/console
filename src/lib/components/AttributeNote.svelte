<script lang="ts">
    /**
     * AttributeNote.svelte
     *
     * Reusable inline note component for a single collection attribute/column.
     * Renders as a subtle "Add note" trigger when empty, or shows the note text
     * with an edit pencil icon when a note exists.
     *
     * Usage:
     *   <AttributeNote
     *       databaseId={$page.params.database}
     *       collectionId={$page.params.collection}
     *       attributeKey={attribute.key}
     *   />
     *
     * Issue: https://github.com/appwrite/appwrite/issues/11945
     */

    import { attributeNotes } from '$lib/stores/attributeNotes';

    interface Props {
        databaseId: string;
        collectionId: string;
        attributeKey: string;
    }

    let { databaseId, collectionId, attributeKey }: Props = $props();

    // Current persisted note value
    let note = $state(attributeNotes.getNote(databaseId, collectionId, attributeKey));

    // Whether the inline editor is open
    let editing = $state(false);

    // Draft copy while the user types
    let draft = $state(note);

    // Textarea ref for auto-focus
    let textareaRef = $state<HTMLTextAreaElement | null>(null);

    $effect(() => {
        if (editing && textareaRef) {
            textareaRef.focus();
            // Place cursor at end
            const len = textareaRef.value.length;
            textareaRef.setSelectionRange(len, len);
        }
    });

    function openEditor() {
        draft = note;
        editing = true;
    }

    function saveNote() {
        const trimmed = draft.trim();
        attributeNotes.setNote(databaseId, collectionId, attributeKey, trimmed);
        note = trimmed;
        editing = false;
    }

    function cancelEdit() {
        draft = note;
        editing = false;
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            cancelEdit();
        } else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            saveNote();
        }
    }

    function clearNote() {
        attributeNotes.setNote(databaseId, collectionId, attributeKey, '');
        note = '';
        editing = false;
    }
</script>

<div class="attribute-note">
    {#if editing}
        <div class="attribute-note__editor">
            <textarea
                bind:this={textareaRef}
                bind:value={draft}
                class="attribute-note__textarea"
                placeholder="Add a note about this column (optional)…"
                rows="3"
                maxlength="500"
                onkeydown={handleKeydown}></textarea>
            <div class="attribute-note__editor-actions">
                <span class="attribute-note__hint">Ctrl+Enter to save · Esc to cancel</span>
                <div class="attribute-note__buttons">
                    {#if note}
                        <button
                            type="button"
                            class="attribute-note__btn attribute-note__btn--danger"
                            onclick={clearNote}
                            title="Remove note">
                            Remove
                        </button>
                    {/if}
                    <button
                        type="button"
                        class="attribute-note__btn attribute-note__btn--secondary"
                        onclick={cancelEdit}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        class="attribute-note__btn attribute-note__btn--primary"
                        onclick={saveNote}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    {:else if note}
        <button
            type="button"
            class="attribute-note__display"
            onclick={openEditor}
            title="Click to edit note">
            <span class="attribute-note__icon attribute-note__icon--note" aria-hidden="true">
                <!-- Sticky note icon (inline SVG, no external deps) -->
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M4 2h12a2 2 0 0 1 2 2v10l-4 4H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linejoin="round" />
                    <path d="M14 14v4l4-4h-4z" fill="currentColor" opacity="0.4" />
                    <path
                        d="M6 7h8M6 10h6"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round" />
                </svg>
            </span>
            <span class="attribute-note__text">{note}</span>
            <span class="attribute-note__icon attribute-note__icon--edit" aria-hidden="true">
                <!-- Pencil icon -->
                <svg
                    width="11"
                    height="11"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M14.69 2.21a1.5 1.5 0 0 1 2.1 2.1L6 15.1 2 16l.9-4L14.69 2.21z"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </span>
        </button>
    {:else}
        <button
            type="button"
            class="attribute-note__add"
            onclick={openEditor}
            title="Add a note to this column">
            <span class="attribute-note__icon" aria-hidden="true">
                <svg
                    width="11"
                    height="11"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M10 4v12M4 10h12"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round" />
                </svg>
            </span>
            Add note
        </button>
    {/if}
</div>

<style>
    .attribute-note {
        display: inline-flex;
        flex-direction: column;
        max-width: 100%;
    }

    /* ── "Add note" trigger ─────────────────────────────────────── */
    .attribute-note__add {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 6px;
        border: 1px dashed var(--color-border, #e0e0e0);
        border-radius: 4px;
        background: transparent;
        color: var(--color-text-tertiary, #999);
        font-size: 11px;
        line-height: 1.4;
        cursor: pointer;
        transition:
            color 0.15s,
            border-color 0.15s;
        white-space: nowrap;
    }
    .attribute-note__add:hover {
        color: var(--color-text-secondary, #666);
        border-color: var(--color-border-strong, #bbb);
    }

    /* ── Existing note display ──────────────────────────────────── */
    .attribute-note__display {
        display: inline-flex;
        align-items: flex-start;
        gap: 5px;
        padding: 4px 6px;
        border: 1px solid transparent;
        border-radius: 4px;
        background: var(--color-surface-note, rgba(255, 200, 0, 0.08));
        color: var(--color-text-secondary, #555);
        font-size: 12px;
        line-height: 1.4;
        cursor: pointer;
        text-align: left;
        max-width: 320px;
        transition:
            background 0.15s,
            border-color 0.15s;
        word-break: break-word;
    }
    .attribute-note__display:hover {
        background: var(--color-surface-note-hover, rgba(255, 200, 0, 0.15));
        border-color: var(--color-border, #e0e0e0);
    }

    .attribute-note__text {
        flex: 1;
        white-space: pre-wrap;
        /* Clamp to 3 lines with ellipsis */
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }

    /* ── Icons ───────────────────────────────────────────────────── */
    .attribute-note__icon {
        display: inline-flex;
        align-items: center;
        flex-shrink: 0;
        margin-top: 1px;
        color: var(--color-text-tertiary, #aaa);
    }
    .attribute-note__icon--edit {
        opacity: 0;
        transition: opacity 0.15s;
    }
    .attribute-note__display:hover .attribute-note__icon--edit {
        opacity: 1;
    }

    /* ── Inline editor ───────────────────────────────────────────── */
    .attribute-note__editor {
        display: flex;
        flex-direction: column;
        gap: 6px;
        width: 320px;
    }

    .attribute-note__textarea {
        width: 100%;
        padding: 8px 10px;
        border: 1px solid var(--color-border-strong, #ccc);
        border-radius: 6px;
        background: var(--color-surface-input, #fff);
        color: var(--color-text-primary, #111);
        font-size: 12px;
        line-height: 1.5;
        font-family: inherit;
        resize: vertical;
        min-height: 72px;
        box-sizing: border-box;
        transition:
            border-color 0.15s,
            box-shadow 0.15s;
    }
    .attribute-note__textarea:focus {
        outline: none;
        border-color: var(--color-primary, #e05a4b);
        box-shadow: 0 0 0 2px rgba(224, 90, 75, 0.15);
    }

    .attribute-note__editor-actions {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
    }

    .attribute-note__hint {
        font-size: 10px;
        color: var(--color-text-tertiary, #aaa);
        flex-shrink: 0;
    }

    .attribute-note__buttons {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-shrink: 0;
    }

    .attribute-note__btn {
        padding: 4px 10px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid transparent;
        transition:
            background 0.15s,
            border-color 0.15s,
            color 0.15s;
        line-height: 1.4;
    }

    .attribute-note__btn--primary {
        background: var(--color-primary, #e05a4b);
        color: #fff;
        border-color: var(--color-primary, #e05a4b);
    }
    .attribute-note__btn--primary:hover {
        background: var(--color-primary-dark, #c94b3d);
        border-color: var(--color-primary-dark, #c94b3d);
    }

    .attribute-note__btn--secondary {
        background: transparent;
        color: var(--color-text-secondary, #555);
        border-color: var(--color-border, #ddd);
    }
    .attribute-note__btn--secondary:hover {
        background: var(--color-surface-hover, #f5f5f5);
    }

    .attribute-note__btn--danger {
        background: transparent;
        color: var(--color-danger, #e05a4b);
        border-color: transparent;
    }
    .attribute-note__btn--danger:hover {
        background: var(--color-surface-danger, rgba(224, 90, 75, 0.08));
        border-color: var(--color-danger, #e05a4b);
    }
</style>
