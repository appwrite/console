import type { MonacoTheme } from '../studio.svelte';

export const imagineLight = {
    base: 'vs',
    inherit: true,
    rules: [
        {
            token: 'comment',
            foreground: '#97979b',
            fontStyle: 'italic'
        },
        {
            token: 'keyword',
            foreground: '#cc0001'
        },
        {
            token: 'string',
            foreground: '#2d2d31'
        },
        {
            token: 'number',
            foreground: '#007fbf'
        },
        {
            token: 'type',
            foreground: '#007fbf'
        },
        {
            token: 'function',
            foreground: '#8040ff'
        },
        {
            token: 'variable',
            foreground: '#2d2d31'
        },
        {
            token: 'constant',
            foreground: '#007fbf'
        },
        {
            token: 'operator',
            foreground: '#cc0001'
        }
    ],
    colors: {
        'editor.background': '#ffffff',
        'editor.foreground': '#2d2d31',
        'editorLineNumber.foreground': '#237893',
        'editorLineNumber.activeForeground': '#0969da',
        'editor.selectionBackground': '#b7d7ff',
        'editor.selectionHighlightBackground': '#b7d7ff80',
        'editor.findMatchBackground': '#ffdf5d',
        'editor.findMatchHighlightBackground': '#ffdf5d55',
        'editorCursor.foreground': '#24292f',
        'editor.lineHighlightBackground': '#f6f8fa',
        'editorIndentGuide.background': '#d1d9e0',
        'editorIndentGuide.activeBackground': '#8c959f',
        'editorWhitespace.foreground': '#d1d9e0'
    }
} satisfies MonacoTheme;
