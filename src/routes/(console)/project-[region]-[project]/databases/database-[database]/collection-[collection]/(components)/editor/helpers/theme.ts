import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// custom theme for layout only (colors handled by SCSS)
export const customTheme = EditorView.theme({
    '&': {
        height: '100%',
        fontFamily: 'var(--font-family-code)',
        fontSize: '14px',
        lineHeight: '1.6'
    },
    '.cm-content': {
        fontFamily: 'var(--font-family-code)',
        padding: 'var(--space-4) 0'
    },
    '.cm-gutters': {
        border: 'none',
        minWidth: '40px'
    },
    '.cm-lineNumbers .cm-gutterElement': {
        textAlign: 'right',
        minWidth: '40px',
        paddingRight: 'var(--space-4)'
    },
    '.cm-line': {
        padding: '0',
        lineHeight: '1.6'
    }
});

// syntax highlighting style (colors applied via SCSS)
export const customHighlight = HighlightStyle.define([
    { tag: tags.propertyName, class: 'cm-propertyName' },
    { tag: tags.string, class: 'cm-string' },
    { tag: tags.special(tags.string), class: 'cm-string' },
    { tag: tags.escape, class: 'cm-string' },
    { tag: tags.number, class: 'cm-number' },
    { tag: tags.bool, class: 'cm-bool' },
    { tag: tags.null, class: 'cm-null' },
    { tag: tags.punctuation, class: 'cm-punctuation' },
    { tag: tags.bracket, class: 'cm-bracket' }
]);

// pre-configured syntax highlighting extension
export const customSyntaxHighlighting = syntaxHighlighting(customHighlight);
