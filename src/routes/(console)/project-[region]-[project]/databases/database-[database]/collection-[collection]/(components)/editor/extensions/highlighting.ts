import {
    Decoration,
    type DecorationSet,
    EditorView,
    GutterMarker,
    gutterLineClass,
    type ViewUpdate,
    ViewPlugin
} from '@codemirror/view';
import { Range, RangeSet, RangeSetBuilder, StateField, type Extension } from '@codemirror/state';
import { forEachDiagnostic, setDiagnosticsEffect } from '@codemirror/lint';
import { NESTED_KEY_REGEX } from '../helpers/constants';

const SYSTEM_FIELDS = ['$id', '$createdAt', '$updatedAt'] as const;

function escapeRegExp(source: string): string {
    return source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Match a system field key at the start of a line, either quoted ("$id") or unquoted ($id).
const SYSTEM_FIELDS_SOURCE = SYSTEM_FIELDS.map(escapeRegExp).join('|');
const SYSTEM_FIELD_KEY_LINE_PATTERN = new RegExp(
    `^\\s*("(?:${SYSTEM_FIELDS_SOURCE})"|(?:${SYSTEM_FIELDS_SOURCE}))\\s*:`
);

function skipInlineWhitespace(text: string, from: number): number {
    let i = from;
    while (i < text.length) {
        const ch = text[i];
        // Don't cross lines; values for the system fields we style are expected to be on the same line.
        if (ch !== ' ' && ch !== '\t') break;
        i += 1;
    }
    return i;
}

function findSingleLineValueEnd(text: string, from: number): number {
    if (from >= text.length) return from;

    const quote = text[from];
    if (quote === '"' || quote === "'") {
        let escaped = false;
        for (let i = from + 1; i < text.length; i += 1) {
            const ch = text[i];
            if (escaped) {
                escaped = false;
                continue;
            }
            if (ch === '\\') {
                escaped = true;
                continue;
            }
            if (ch === quote) {
                return i + 1;
            }
            if (ch === '\n' || ch === '\r') {
                return i;
            }
        }
        return text.length;
    }

    // Scalar token: read until comma or newline.
    for (let i = from; i < text.length; i += 1) {
        const ch = text[i];
        if (ch === ',' || ch === '\n' || ch === '\r') {
            return i;
        }
    }
    return text.length;
}

// ViewPlugin to highlight nested keys (4+ spaces) only in visible ranges
export function createNestedKeyPlugin(): Extension {
    return ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;
            constructor(view: EditorView) {
                this.decorations = this.compute(view);
            }
            update(update: ViewUpdate) {
                if (update.docChanged || update.viewportChanged) {
                    this.decorations = this.compute(update.view);
                }
            }
            compute(view: EditorView): DecorationSet {
                const decos: Range<Decoration>[] = [];
                for (const { from, to } of view.visibleRanges) {
                    let line = view.state.doc.lineAt(from);
                    while (line.from <= to) {
                        const text = line.text;
                        const m = text.match(NESTED_KEY_REGEX);
                        if (m) {
                            const leading = m[1];
                            const key = m[2];
                            const start = line.from + leading.length;
                            const end = start + key.length;
                            decos.push(
                                Decoration.mark({ class: 'cm-nestedPropertyName' }).range(
                                    start,
                                    end
                                )
                            );
                        }
                        if (line.to >= to) break;
                        line = view.state.doc.line(line.number + 1);
                    }
                }
                return Decoration.set(decos);
            }
        },
        { decorations: (v) => v.decorations }
    );
}

// ViewPlugin to apply muted styling to system fields ($id, $createdAt, $updatedAt)
export function createSystemFieldStylePlugin(getShouldStyle: () => boolean): Extension {
    const mutedMark = Decoration.mark({ class: 'cm-system-field-muted' });

    return ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;
            constructor(view: EditorView) {
                this.decorations = this.compute(view);
            }
            update(update: ViewUpdate) {
                // Only recompute when document changes
                if (update.docChanged) {
                    this.decorations = this.compute(update.view);
                }
            }
            compute(view: EditorView): DecorationSet {
                const shouldStyle = getShouldStyle();

                if (!shouldStyle) {
                    return Decoration.none;
                }

                const doc = view.state.doc;
                const text = doc.toString();
                const decos: Range<Decoration>[] = [];

                for (let ln = 1; ln <= doc.lines; ln += 1) {
                    const line = doc.line(ln);
                    const match = SYSTEM_FIELD_KEY_LINE_PATTERN.exec(line.text);
                    if (!match) continue;

                    const keyToken = match[1]; // either "$id" or $id
                    const keyOffset = match[0].indexOf(keyToken);
                    const from = line.from + keyOffset;
                    const to = line.from + match[0].length;

                    decos.push(mutedMark.range(from, to));

                    const valueFrom = skipInlineWhitespace(text, to);
                    const valueTo = findSingleLineValueEnd(text, valueFrom);
                    if (valueTo > valueFrom) {
                        decos.push(mutedMark.range(valueFrom, valueTo));
                    }
                }

                return Decoration.set(decos);
            }
        },
        { decorations: (v) => v.decorations }
    );
}

export function createErrorLineHighlight(): Extension {
    const errorLineDecoration = Decoration.line({
        attributes: { class: 'cm-error-line' }
    });

    class ErrorLineGutterMarker extends GutterMarker {
        elementClass = 'cm-error-lineGutter';
    }

    const errorLineGutterMarker = new ErrorLineGutterMarker();

    type ErrorLineDecorations = {
        line: DecorationSet;
        gutter: RangeSet<GutterMarker>;
    };

    const buildDecorations = (state: import('@codemirror/state').EditorState) => {
        const lineBuilder = new RangeSetBuilder<Decoration>();
        const gutterBuilder = new RangeSetBuilder<GutterMarker>();
        const seenLines = new Set<number>();

        forEachDiagnostic(state, (diagnostic, from) => {
            if (diagnostic.severity !== 'error') return;
            try {
                const line = state.doc.lineAt(from);
                if (seenLines.has(line.from)) return;
                seenLines.add(line.from);
                lineBuilder.add(line.from, line.from, errorLineDecoration);
                gutterBuilder.add(line.from, line.from, errorLineGutterMarker);
            } catch {
                // line might not exist
            }
        });

        return {
            line: lineBuilder.finish(),
            gutter: gutterBuilder.finish()
        };
    };

    return StateField.define<ErrorLineDecorations>({
        create(state) {
            return buildDecorations(state);
        },
        update(decorations, tr) {
            const hasDiagnosticsUpdate = tr.effects.some((effect) =>
                effect.is(setDiagnosticsEffect)
            );
            if (!tr.docChanged && !hasDiagnosticsUpdate) {
                return decorations;
            }
            return buildDecorations(tr.state);
        },
        provide: (f) => [
            EditorView.decorations.compute([f], (state) => state.field(f).line),
            gutterLineClass.compute([f], (state) => state.field(f).gutter)
        ]
    });
}
