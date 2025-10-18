import { searchKeymap } from '@codemirror/search';
import { closeBracketsKeymap } from '@codemirror/autocomplete';
import type { EditorView, KeyBinding } from '@codemirror/view';
import { defaultKeymap, historyKeymap, indentLess, indentMore } from '@codemirror/commands';

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

    return keymaps;
}

// Secondary keymaps - these are standard CodeMirror keymaps
export const secondaryKeymaps = [
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap
];
