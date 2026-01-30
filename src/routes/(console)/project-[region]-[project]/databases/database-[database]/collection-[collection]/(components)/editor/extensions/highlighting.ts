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
                const systemFields = ['$id', '$createdAt', '$updatedAt'];
                const decos: Range<Decoration>[] = [];

                // Find all occurrences of system field keys
                for (const field of systemFields) {
                    // Match the key in format: "$id": or $id: (with or without quotes)
                    const quotedPattern = new RegExp(`"${field.replace('$', '\\$')}"\\s*:`, 'g');
                    const unquotedPattern = new RegExp(`${field.replace('$', '\\$')}\\s*:`, 'g');

                    let match: RegExpExecArray;
                    // Check quoted format
                    while ((match = quotedPattern.exec(text)) !== null) {
                        const from = match.index;
                        const to = from + field.length + 2; // +2 for quotes
                        decos.push(
                            Decoration.mark({ class: 'cm-system-field-muted' }).range(from, to)
                        );
                    }

                    // Check unquoted format
                    while ((match = unquotedPattern.exec(text)) !== null) {
                        const from = match.index;
                        const to = from + field.length;
                        decos.push(
                            Decoration.mark({ class: 'cm-system-field-muted' }).range(from, to)
                        );
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
