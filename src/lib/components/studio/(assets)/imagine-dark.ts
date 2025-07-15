import type { MonacoTheme } from '../studio.svelte';

export const imagineDark = {
    base: 'vs-dark',
    inherit: true,
    rules: [
        {
            token: '',
            foreground: '#d4d4d4',
            background: '#1e1e1e'
        },
        {
            token: 'variable',
            foreground: '#ededf0'
        },
        {
            token: 'variable.parameter',
            foreground: '#ededf0'
        },
        {
            token: 'entity.name.variable',
            foreground: '#ededf0'
        },
        {
            token: 'keyword',
            foreground: '#ff6667'
        },
        {
            token: 'keyword.control',
            foreground: '#ff6667'
        },
        {
            token: 'keyword.operator',
            foreground: '#ff6667'
        },
        {
            token: 'number',
            foreground: '#8cd9ff'
        },
        {
            token: 'constant.numeric',
            foreground: '#8cd9ff'
        },
        {
            token: 'constant',
            foreground: '#8cd9ff'
        },
        {
            token: 'constant.language',
            foreground: '#8cd9ff'
        },
        {
            token: 'entity.name.class',
            foreground: '#8cd9ff'
        },
        {
            token: 'entity.name.type',
            foreground: '#8cd9ff'
        },
        {
            token: 'function',
            foreground: '#b38cff'
        },
        {
            token: 'method',
            foreground: '#b38cff'
        },
        {
            token: 'type.identifier',
            foreground: '#b38cff'
        },
        {
            token: 'support.function',
            foreground: '#b38cff'
        },
        {
            token: 'string',
            foreground: '#ededf0'
        },
        {
            token: 'string.quoted',
            foreground: '#ededf0'
        },
        {
            token: 'comment',
            foreground: '#818186'
        },
        {
            token: 'comment.line',
            foreground: '#818186'
        },
        {
            token: 'comment.block',
            foreground: '#818186'
        }
    ],
    colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editorCursor.foreground': '#d4d4d4',
        'editor.selectionBackground': '#264f78',
        'editor.selectionHighlightBackground': '#264f78',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070'
    }
} satisfies MonacoTheme;
