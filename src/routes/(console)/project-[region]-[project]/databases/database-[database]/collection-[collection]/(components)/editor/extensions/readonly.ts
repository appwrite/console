import { Decoration, type DecorationSet, EditorView } from '@codemirror/view';
import { StateField, Transaction, Range } from '@codemirror/state';
import type { Text } from '@codemirror/state';
import { SYSTEM_KEYS } from '../helpers/constants';

// Find ranges of system keys (lines starting with $id, $createdAt, $updatedAt)
// When isNew=true, skip all readonly range detection since we don't have timestamps yet
export function findReadOnlyRanges(doc: Text, isNew: boolean): Array<{ from: number; to: number }> {
    // When creating a new document, allow editing everything
    if (isNew) return [];

    const ranges: Array<{ from: number; to: number }> = [];
    let found = 0;

    for (let i = 1; i <= doc.lines; i++) {
        const line = doc.line(i);
        const lineText = line.text.trim();
        for (const key of SYSTEM_KEYS) {
            if (lineText.startsWith(key)) {
                ranges.push({ from: line.from, to: line.to });
                found++;
                break;
            }
        }
        if (found === SYSTEM_KEYS.size) break;
    }

    return ranges;
}

// Ranges field for read-only system lines (single source of truth)
export const createReadOnlyRangesField = (isNew: boolean) =>
    StateField.define<ReadonlyArray<{ from: number; to: number }>>({
        create(state) {
            return findReadOnlyRanges(state.doc, isNew);
        },
        update(value, tr) {
            if (!tr.docChanged) return value;
            return findReadOnlyRanges(tr.state.doc, isNew);
        }
    });

// State field to add decorations to read-only lines
export const createReadOnlyLineField = (
    readOnlyRangesField: StateField<ReadonlyArray<{ from: number; to: number }>>
) =>
    StateField.define<DecorationSet>({
        create(state) {
            const decorations: Range<Decoration>[] = [];
            const readOnlyRanges = state.field(readOnlyRangesField);

            for (const range of readOnlyRanges) {
                decorations.push(
                    Decoration.line({
                        class: 'cm-readOnlyLine'
                    }).range(range.from)
                );
            }

            return Decoration.set(decorations);
        },
        update(decorations, tr) {
            if (!tr.docChanged) return decorations;

            const newDecorations: Range<Decoration>[] = [];
            const readOnlyRanges = tr.state.field(readOnlyRangesField);

            for (const range of readOnlyRanges) {
                newDecorations.push(
                    Decoration.line({
                        class: 'cm-readOnlyLine'
                    }).range(range.from)
                );
            }

            return Decoration.set(newDecorations);
        },
        provide: (f) => EditorView.decorations.from(f)
    });

// Transaction filter to prevent edits on system key lines
export const createReadOnlyRangesFilter = (
    readOnlyRangesField: StateField<ReadonlyArray<{ from: number; to: number }>>,
    readonly: boolean
) => {
    return (tr: Transaction) => {
        if (readonly || !tr.docChanged) return tr;
        const ue = tr.annotation(Transaction.userEvent);
        if (typeof ue === 'string' && ue.startsWith('appwrite:')) {
            return tr;
        }

        const startDoc = tr.startState.doc;
        const readOnlyRanges = tr.startState.field(readOnlyRangesField);
        let blocked = false;
        let fullReplace = false;

        tr.changes.iterChanges((fromA: number, toA: number) => {
            // Allow full-document replacement (Select All → Paste)
            if (fromA === 0 && toA === startDoc.length) {
                fullReplace = true;
                return;
            }

            // Check if change overlaps with any read-only range
            for (const range of readOnlyRanges) {
                if (
                    // treat line ranges as half-open [from, to)
                    (fromA >= range.from && fromA < range.to) ||
                    (toA > range.from && toA < range.to) ||
                    (fromA < range.from && toA > range.to)
                ) {
                    blocked = true;
                    break;
                }
            }
        });

        if (fullReplace) return tr;
        // Block the transaction if it tries to edit a read-only range
        return blocked ? [] : tr;
    };
};
