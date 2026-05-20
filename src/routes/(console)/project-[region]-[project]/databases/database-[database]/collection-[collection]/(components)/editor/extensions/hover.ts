import { StateEffect, StateField, type Extension, RangeSet, Transaction } from '@codemirror/state';
import { Decoration, EditorView, GutterMarker, gutterLineClass } from '@codemirror/view';

class HoveredLineGutterMarker extends GutterMarker {
    elementClass = 'cm-hovered-lineGutter';
}

const hoveredGutterMarker = new HoveredLineGutterMarker();

const setHoveredLine = StateEffect.define<number | null>();

const hoveredLineField = StateField.define<number | null>({
    create: () => null,
    update: (value, tr) => {
        for (const e of tr.effects) if (e.is(setHoveredLine)) return e.value;
        if (value === null) return null;
        if (tr.docChanged) {
            return tr.changes.mapPos(value);
        }
        return value;
    },
    provide: (f) => [
        gutterLineClass.compute([f], (state) => {
            const linePos = state.field(f);
            if (linePos === null) return RangeSet.empty;
            try {
                return RangeSet.of([hoveredGutterMarker.range(state.doc.lineAt(linePos).from)]);
            } catch {
                return RangeSet.empty;
            }
        }),
        EditorView.decorations.compute([f], (state) => {
            const linePos = state.field(f);
            if (linePos === null) return Decoration.none;
            try {
                return Decoration.set([
                    Decoration.line({ class: 'cm-hovered-line' }).range(
                        state.doc.lineAt(linePos).from
                    )
                ]);
            } catch {
                return Decoration.none;
            }
        })
    ]
});

export function createLineHoverPlugin(): Extension {
    return [
        hoveredLineField,
        EditorView.domEventHandlers({
            mousemove(e, view) {
                const currentHovered = view.state.field(hoveredLineField);
                const pos =
                    view.posAtCoords({ x: e.clientX, y: e.clientY }) ??
                    (() => {
                        const rect = view.contentDOM.getBoundingClientRect();
                        if (e.clientY < rect.top || e.clientY > rect.bottom) {
                            return null;
                        }
                        return view.posAtCoords({ x: rect.left + 2, y: e.clientY });
                    })();

                if (pos === null) {
                    if (currentHovered !== null) {
                        view.dispatch({
                            effects: setHoveredLine.of(null),
                            annotations: Transaction.userEvent.of('appwrite:hover')
                        });
                    }
                    return false;
                }

                const linePos = view.state.doc.lineAt(pos).from;
                if (currentHovered !== linePos) {
                    view.dispatch({
                        effects: setHoveredLine.of(linePos),
                        annotations: Transaction.userEvent.of('appwrite:hover')
                    });
                }
                return false;
            },
            mouseleave(_, view) {
                if (view.state.field(hoveredLineField) !== null) {
                    view.dispatch({
                        effects: setHoveredLine.of(null),
                        annotations: Transaction.userEvent.of('appwrite:hover')
                    });
                }
                return false;
            }
        }),
        EditorView.updateListener.of((update) => {
            if (!update.viewportChanged) return;
            if (update.state.field(hoveredLineField) === null) return;
            update.view.dispatch({
                effects: setHoveredLine.of(null),
                annotations: Transaction.userEvent.of('appwrite:hover')
            });
        })
    ];
}
