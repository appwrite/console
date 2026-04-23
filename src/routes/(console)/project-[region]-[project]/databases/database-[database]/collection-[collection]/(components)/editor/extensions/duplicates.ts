import { json5ParseCache } from 'codemirror-json5';
import { ensureSyntaxTree } from '@codemirror/language';
import { linter, type Diagnostic } from '@codemirror/lint';
import type { SyntaxNode, TreeCursor } from '@lezer/common';
import type { EditorState, Extension } from '@codemirror/state';

type Options = {
    delay?: number;
    timeBudgetMs?: number;
    maxDocLength?: number;
};

const DEFAULT_TIME_BUDGET_MS = 200;
const CHECK_BUDGET_EVERY = 200;

function normalizeKey(raw: string): string {
    const trimmed = raw.trim();
    if (trimmed.length < 2) return trimmed;
    const first = trimmed[0];
    const last = trimmed[trimmed.length - 1];
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
        return trimmed.slice(1, -1);
    }
    return trimmed;
}

function nowMs(): number {
    return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

function readPropertyName(
    node: SyntaxNode,
    state: EditorState
): { key: string; from: number; to: number } | null {
    const propName = node.getChild('PropertyName');
    if (!propName) return null;
    const raw = state.doc.sliceString(propName.from, propName.to);
    return { key: normalizeKey(raw), from: propName.from, to: propName.to };
}

function collectDuplicateKeys(
    state: EditorState,
    cursor: TreeCursor,
    deadlineMs: number
): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    const walker = cursor;
    let visited = 0;

    do {
        if (visited % CHECK_BUDGET_EVERY === 0 && nowMs() > deadlineMs) {
            break;
        }
        visited += 1;
        if (walker.name === 'Object') {
            const objectNode = walker.node;
            const objectCursor = objectNode.cursor();
            const seen = new Map<string, { from: number; to: number }>();
            if (objectCursor.firstChild()) {
                do {
                    if (objectCursor.name === 'Property') {
                        const keyInfo = readPropertyName(objectCursor.node, state);
                        if (!keyInfo || !keyInfo.key) continue;
                        const previous = seen.get(keyInfo.key);
                        if (previous) {
                            diagnostics.push({
                                from: keyInfo.from,
                                to: keyInfo.to,
                                severity: 'warning',
                                message: `Duplicate key "${keyInfo.key}"`
                            });
                        } else {
                            seen.set(keyInfo.key, { from: keyInfo.from, to: keyInfo.to });
                        }
                    }
                } while (objectCursor.nextSibling());
            }
        }
    } while (walker.next());

    return diagnostics;
}

export function createDuplicateKeyLinter(options: Options = {}): Extension {
    const timeBudgetMs = options.timeBudgetMs ?? DEFAULT_TIME_BUDGET_MS;
    return linter(
        (view) => {
            if (options.maxDocLength && view.state.doc.length > options.maxDocLength) {
                return [];
            }
            const parseCache = view.state.field(json5ParseCache, false);
            if (parseCache?.err) return [];
            const tree = ensureSyntaxTree(view.state, view.state.doc.length, timeBudgetMs);
            if (!tree) return [];
            const deadlineMs = nowMs() + timeBudgetMs;
            return collectDuplicateKeys(view.state, tree.cursor(), deadlineMs);
        },
        { delay: options.delay }
    );
}
