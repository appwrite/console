import {
    Decoration,
    type DecorationSet,
    EditorView,
    type ViewUpdate,
    ViewPlugin
} from '@codemirror/view';
import { Range } from '@codemirror/state';
import { NESTED_KEY_REGEX } from '../helpers/constants';

// ViewPlugin to highlight nested keys (4+ spaces) only in visible ranges
export const nestedKeyPlugin = ViewPlugin.fromClass(
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
                            Decoration.mark({ class: 'cm-nestedPropertyName' }).range(start, end)
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
