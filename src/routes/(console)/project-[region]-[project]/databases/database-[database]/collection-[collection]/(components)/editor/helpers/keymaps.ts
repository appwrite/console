import { searchKeymap } from '@codemirror/search';
import { closeBracketsKeymap } from '@codemirror/autocomplete';
import type { EditorView, KeyBinding } from '@codemirror/view';
import { defaultKeymap, historyKeymap, indentLess, indentMore } from '@codemirror/commands';

// main editor keymaps,
// these require functions from the component
export function createEditorKeymaps(
    insertNewlineKeepIndent: (view: EditorView) => boolean
): KeyBinding[] {
    return [
        { key: 'Tab', run: indentMore },
        { key: 'Enter', run: insertNewlineKeepIndent },
        { key: 'Shift-Enter', run: insertNewlineKeepIndent },
        { key: 'Shift-Tab', run: indentLess }
    ];
}

// Secondary keymaps - these are standard CodeMirror keymaps
export const secondaryKeymaps = [
    ...closeBracketsKeymap,
    ...defaultKeymap,
    ...searchKeymap,
    ...historyKeymap
];
