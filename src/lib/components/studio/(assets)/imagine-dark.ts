export const imagineDark = {
    base: 'vs-dark' as 'vs' | 'vs-dark',
    inherit: true,
    rules: [
        {
            token: 'comment',
            foreground: '#818186',
            fontStyle: 'italic'
        },
        {
            token: 'keyword',
            foreground: '#ff6667'
        },
        {
            token: 'string',
            foreground: '#6edf00'
        },
        {
            token: 'number',
            foreground: '#8cd9ff'
        },
        {
            token: 'type',
            foreground: '#8cd9ff'
        },
        {
            token: 'function',
            foreground: '#ff00ff'
        },
        {
            token: 'variable',
            foreground: '#6edf00'
        },
        {
            token: 'constant',
            foreground: '#8cd9ff'
        },
        {
            token: 'operator',
            foreground: '#ff6667'
        }
    ],
    colors: {
        'editor.background': '#1e1e1e',
        'editor.foreground': '#d4d4d4',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#c6c6c6',
        'editor.selectionBackground': '#264f78',
        'editor.selectionHighlightBackground': '#264f7880',
        'editor.findMatchBackground': '#515c6a',
        'editor.findMatchHighlightBackground': '#ea5c0055',
        'editorCursor.foreground': '#aeafad',
        'editor.lineHighlightBackground': '#2a2d2e',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
        'editorWhitespace.foreground': '#404040'
    }
};
