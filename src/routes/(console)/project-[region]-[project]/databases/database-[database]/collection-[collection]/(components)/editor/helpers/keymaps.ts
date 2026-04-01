/*import { searchKeymap } from '@codemirror/search';*/
import { closeBracketsKeymap } from '@codemirror/autocomplete';
import type { EditorView, KeyBinding } from '@codemirror/view';
import { EditorSelection, Transaction } from '@codemirror/state';
import { defaultKeymap, historyKeymap, indentLess, indentMore } from '@codemirror/commands';

function duplicateSelectionOrLine(view: EditorView): boolean {
    const state = view.state;

    const transaction = state.changeByRange((range) => {
        if (range.empty) {
            const line = state.doc.lineAt(range.head);
            const column = range.head - line.from;
            const insertText = `\n${line.text}`;
            const insertPos = line.to;
            const newPos = insertPos + 1 + column;

            return {
                changes: { from: insertPos, insert: insertText },
                range: EditorSelection.cursor(newPos)
            };
        }

        const insertText = state.doc.sliceString(range.from, range.to);
        const insertPos = range.to;
        const newFrom = range.from + insertText.length;
        const newTo = range.to + insertText.length;

        return {
            changes: { from: insertPos, insert: insertText },
            range: EditorSelection.range(newFrom, newTo)
        };
    });

    view.dispatch({
        ...transaction,
        annotations: Transaction.userEvent.of('input')
    });
    return true;
}

function createDuplicateLineKeymap(): KeyBinding {
    return {
        key: 'Mod-d',
        preventDefault: true,
        run: duplicateSelectionOrLine
    };
}

// main editor keymaps,
// these require functions from the component
export function createEditorKeymaps(
    insertNewlineKeepIndent: (view: EditorView) => boolean,
    onSave?: () => Promise<void> | void
): KeyBinding[] {
    const keymaps: KeyBinding[] = [
        { key: 'Tab', run: indentMore },
        { key: 'Enter', run: insertNewlineKeepIndent },
        { key: 'Shift-Enter', run: insertNewlineKeepIndent },
        { key: 'Shift-Tab', run: indentLess }
    ];

    // Add Cmd/Ctrl+S save shortcut if save handler is provided
    if (onSave) {
        keymaps.push({
            key: 'Mod-s',
            preventDefault: true,
            run: () => {
                onSave();
                return true;
            }
        });
    }

    // Disable search/replace for now!
    keymaps.push({
        key: 'Mod-f',
        preventDefault: true,
        run: () => true
    });

    keymaps.push(createDuplicateLineKeymap());

    return keymaps;
}

// Secondary keymaps - these are standard CodeMirror keymaps
export const secondaryKeymaps = [
    ...closeBracketsKeymap,
    ...defaultKeymap,
    /*...searchKeymap,*/
    ...historyKeymap
];
