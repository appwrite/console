<script lang="ts" module>
    export type JsonValue = string | number | boolean | null | JsonObject | JsonArray | object;
    export type JsonObject = { [key: string]: JsonValue };
    export type JsonArray = JsonValue[];
</script>

<script lang="ts">
    import {
        EditorView,
        keymap,
        lineNumbers,
        highlightActiveLine,
        highlightActiveLineGutter,
        Decoration,
        type DecorationSet,
        type ViewUpdate,
        ViewPlugin
    } from '@codemirror/view';
    import { history } from '@codemirror/commands';
    import {
        bracketMatching,
        foldGutter,
        foldEffect,
        indentOnInput,
        indentUnit
    } from '@codemirror/language';
    import { highlightSelectionMatches } from '@codemirror/search';
    import { closeBrackets } from '@codemirror/autocomplete';
    import { javascript } from '@codemirror/lang-javascript';
    import { type Diagnostic, linter } from '@codemirror/lint';
    import {
        EditorState,
        EditorSelection,
        Range,
        StateField,
        Transaction,
        Compartment,
        type Extension
    } from '@codemirror/state';
    import type { Text } from '@codemirror/state';
    import { onMount, onDestroy } from 'svelte';
    import Id, { truncateId } from '$lib/components/id.svelte';
    import { Icon, Layout, Skeleton, Spinner, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import { IconCheck, IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import { Button } from '$lib/elements/forms';
    import { copy } from '$lib/helpers/copy';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { slide } from 'svelte/transition';

    import { parse } from './validators/json5';
    import { customTheme, customSyntaxHighlighting } from './helpers/theme';
    import { createEditorKeymaps, secondaryKeymaps } from './helpers/keymaps';
    import {
        ALLOWED_DOLLAR_PROPS,
        SYSTEM_KEYS,
        DEBOUNCE_DELAY,
        LINTER_DELAY,
        INDENT_REGEX,
        SCALAR_VALUE_REGEX,
        TRAILING_COMMA_REGEX,
        WHITESPACE_REGEX,
        WHITESPACE_ONLY_REGEX,
        NESTED_KEY_REGEX,
        SKELETON_LINES,
        getIndent
    } from './helpers/constants';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { ID } from '@appwrite.io/console';
    import { areObjectsSame } from '$lib/helpers/object';

    interface Props {
        isNew?: boolean;
        data?: JsonValue;
        isSaving?: boolean;
        loading?: boolean;
        onChange?: (newData: JsonValue) => Promise<void> | void;
        onSave?: (newData: JsonValue) => Promise<void> | void;
        readonly?: boolean;
        wrapLines?: boolean;
        errorInPlace?: boolean;
        ctrlSave?: boolean;
    }

    let {
        isNew = false,
        data = $bindable(),
        onChange,
        onSave,
        isSaving = $bindable(false),
        loading = false,
        readonly = false,
        wrapLines = true,
        errorInPlace = true,
        ctrlSave = false
    }: Props = $props();

    let editorContainer: HTMLDivElement = $state(null);

    let editorView: EditorView | null = null;
    let errorMessage = $state<string | null>(null);
    let changeTimer: ReturnType<typeof setTimeout> | null = null; // debounce timer for parse + onChange
    let pendingCanonicalize = false; // set when a full-document replace (paste-all) occurs
    let lastExpectedContent = ''; // track latest serialized data to avoid spurious rewrites
    let lastDocId: string | null = null; // track current document identity for history reset
    let baseExtensions: Extension[] = []; // cached extension set to rebuild state on doc switch
    const readOnlyCompartment = new Compartment();
    const wrapCompartment = new Compartment();

    let tooltipMessage = $state('Copy document');

    // Store the original data to preserve system values
    let originalData = $state<JsonValue>($state.snapshot(data));

    // Check for enable, disable save button.
    const hasDataChanged = $derived(!areObjectsSame(data, originalData));

    let isUpdatingFromEditor = false;

    // Track previous isNew state to detect transitions
    let wasNew = isNew;

    // Generate a stable ID once for new documents
    let generatedId = $state(ID.unique());

    // Get $id from data
    const documentId = $derived(
        data && typeof data === 'object' && !Array.isArray(data) && '$id' in data && data.$id
            ? String(data.$id)
            : generatedId
    );

    // Convert data to formatted JavaScript object notation (no quotes on keys)
    function dataToString(value: JsonValue, indent = 0, key?: string): string {
        const indentStr = getIndent(indent);
        const type = getType(value);

        if (type === 'object') {
            const entries = Object.entries(value as JsonObject);
            if (entries.length === 0) return '{}';

            // Filter out $ prefixed properties except allowed ones
            const filteredEntries = entries.filter(([key]) => {
                if (key.startsWith('$')) {
                    return ALLOWED_DOLLAR_PROPS.includes(
                        key as (typeof ALLOWED_DOLLAR_PROPS)[number]
                    );
                }
                return true;
            });

            if (filteredEntries.length === 0) return '{}';

            // Sort entries: $id first, user fields in middle, timestamps last
            const sortedEntries = filteredEntries.sort(([keyA], [keyB]) => {
                // $id always comes first
                if (keyA === '$id') return -1;
                if (keyB === '$id') return 1;

                // $createdAt and $updatedAt always come last
                const isKeyATimestamp = keyA === '$createdAt' || keyA === '$updatedAt';
                const isKeyBTimestamp = keyB === '$createdAt' || keyB === '$updatedAt';

                if (isKeyATimestamp && !isKeyBTimestamp) return 1;
                if (!isKeyATimestamp && isKeyBTimestamp) return -1;

                return 0;
            });

            const props = sortedEntries.map(([key, val], index) => {
                const isLast = index === sortedEntries.length - 1;
                const formattedValue = dataToString(val, indent + 1, key);
                return `${indentStr}  ${key}: ${formattedValue}${isLast ? '' : ','}`;
            });

            return `{\n${props.join('\n')}\n${indentStr}}`;
        } else if (type === 'array') {
            const items = value as JsonArray;
            if (items.length === 0) return '[]';

            const elements = items.map((item, index) => {
                const isLast = index === items.length - 1;
                const formattedValue = dataToString(item, indent + 1);
                return `${indentStr}  ${formattedValue}${isLast ? '' : ','}`;
            });

            return `[\n${elements.join('\n')}\n${indentStr}]`;
        } else if (type === 'string') {
            // Format timestamps for display if this is a $createdAt or $updatedAt field
            if ((key === '$createdAt' || key === '$updatedAt') && value) {
                try {
                    const valueAsString = String(value);
                    return `"${toLocaleDateTime(valueAsString)}"`;
                } catch {
                    // If parsing fails, fall back to regular formatting
                }
            }

            // Properly escape strings for JavaScript
            const escaped = (value as string)
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r')
                .replace(/\t/g, '\\t');
            return `"${escaped}"`;
        } else if (type === 'null') {
            return 'null';
        } else {
            return String(value);
        }
    }

    function getType(value: JsonValue): string {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    }

    // Find ranges of system keys (lines starting with $id, $createdAt, $updatedAt)
    // When isNew=true, skip all readonly range detection since we don't have timestamps yet
    function findReadOnlyRanges(doc: Text): Array<{ from: number; to: number }> {
        // When creating a new document, allow editing everything
        if (isNew) return [];

        const ranges: Array<{ from: number; to: number }> = [];
        let found = 0;

        for (let i = 1; i <= doc.lines; i++) {
            const line = doc.line(i);
            const lineText = line.text.trim();
            for (const key of SYSTEM_KEYS) {
                if (lineText.startsWith(key)) {
                    ranges.push({ from: line.from, to: line.to });
                    found++;
                    break;
                }
            }
            if (found === SYSTEM_KEYS.size) break;
        }

        return ranges;
    }

    // Preserve system key values when content changes
    function preserveSystemValues(parsed: JsonValue): JsonValue {
        if (
            typeof parsed === 'object' &&
            parsed !== null &&
            !Array.isArray(parsed) &&
            typeof originalData === 'object' &&
            originalData !== null &&
            !Array.isArray(originalData)
        ) {
            const parsedObj = parsed as JsonObject;
            const originalObj = originalData as JsonObject;

            // Restore only the editor-visible system fields from the original document
            // Skip $id preservation when creating a new document to allow user edits
            if (!isNew && originalObj.$id !== undefined) {
                parsedObj.$id = originalObj.$id;
            }

            if (originalObj.$createdAt !== undefined) {
                parsedObj.$createdAt = originalObj.$createdAt;
            }

            if (originalObj.$updatedAt !== undefined) {
                parsedObj.$updatedAt = originalObj.$updatedAt;
            }
        }
        return parsed;
    }

    // Enter: insert newline keeping previous line's indent (no extra +2)
    // If cursor is at end-of-line after a scalar value property lacking a trailing comma,
    // add the comma automatically before inserting the newline.
    function insertNewlineKeepIndent(view: EditorView): boolean {
        const state = view.state;
        const sel = state.selection.main;
        const line = state.doc.lineAt(sel.head);
        const indent = (line.text.match(INDENT_REGEX) || [''])[0];

        // Only handle end-of-line case; let default handlers manage everything else
        const atLineEnd = sel.head === line.to;
        if (!atLineEnd) {
            return false; // Let default Enter handler take over
        }

        const text = state.doc.sliceString(line.from, line.to);
        let addComma = false;

        if (!text.trimStart().startsWith('$')) {
            const hasComma = TRAILING_COMMA_REGEX.test(text);
            addComma = SCALAR_VALUE_REGEX.test(text) && !hasComma;
        }

        const insert = (addComma ? ',' : '') + '\n' + indent;
        view.dispatch({
            changes: { from: sel.from, to: sel.to, insert },
            selection: EditorSelection.cursor(sel.from + insert.length),
            userEvent: 'input'
        });
        return true;
    }

    // Expand property value `: {}` or `: []` into multi-line block with a trailing comma
    // Also enforce a single space after the colon.
    function maybeExpandEmptyLiteral(update: ViewUpdate): boolean {
        const doc = update.state.doc;
        let did = false;
        update.changes.iterChanges((_: number, __: number, ___: number, toB: number) => {
            if (did) return;
            const line = doc.lineAt(toB);
            const upto = doc.sliceString(line.from, toB);
            // Only when adding a new value at end of line: `key: {}` or `key: []`
            const m = /:\s*({}|\[])\s*$/.exec(upto);
            if (!m) return;

            // Skip system fields
            if (line.text.trimStart().startsWith('$')) return;

            const lit = m[1];
            const isObj = lit === '{}';
            const open = isObj ? '{' : '[';
            const close = isObj ? '}' : ']';

            const litStartInLine = upto.lastIndexOf(open);
            if (litStartInLine < 0) return;
            const colonIndex = upto.lastIndexOf(':', litStartInLine);

            const baseIndent = (line.text.match(WHITESPACE_REGEX) || [''])[0];
            const innerIndent = baseIndent + '  ';

            const afterColon = colonIndex >= 0 ? upto.slice(colonIndex + 1, litStartInLine) : '';
            const needSpaceAfterColon =
                afterColon.length === 0 || !WHITESPACE_ONLY_REGEX.test(afterColon);

            const replaceFrom = line.from + (needSpaceAfterColon ? colonIndex + 1 : litStartInLine);
            const replaceTo = line.from + litStartInLine + 2; // replace '{}' or '[]'
            const replacement =
                (needSpaceAfterColon ? ' ' : '') +
                `${open}\n${innerIndent}\n${baseIndent}${close},`;
            const cursor = replaceFrom + replacement.indexOf('\n') + 1 + innerIndent.length;

            update.view.dispatch({
                changes: { from: replaceFrom, to: replaceTo, insert: replacement },
                selection: EditorSelection.cursor(cursor),
                userEvent: 'input'
            });
            did = true;
        });
        return did;
    }

    // In-place patch: ensure top-level $ system fields reflect originals without reformatting the whole doc
    function applySystemFieldsPatch(view: EditorView, doc: Text, parsed: JsonValue): boolean {
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
        const obj = parsed as JsonObject;
        const want: Array<{ key: '$id' | '$createdAt' | '$updatedAt'; text: string }> = [
            { key: '$id', text: dataToString(obj.$id ?? null) },
            { key: '$createdAt', text: dataToString(obj.$createdAt ?? null) },
            { key: '$updatedAt', text: dataToString(obj.$updatedAt ?? null) }
        ];

        const s = doc.toString();
        const openIdx = s.indexOf('{');
        const closeIdx = s.lastIndexOf('}');
        if (openIdx === -1 || closeIdx === -1 || closeIdx <= openIdx) return false;

        // Determine indentation for top-level props
        let indent = '  ';
        {
            const afterOpenNL = s.indexOf('\n', openIdx);
            if (afterOpenNL !== -1) {
                const lineStart = afterOpenNL + 1;
                const lineEnd =
                    s.indexOf('\n', lineStart) === -1 ? closeIdx : s.indexOf('\n', lineStart);
                const line = s.slice(lineStart, lineEnd);
                const m = line.match(/^(\s+)/);
                if (m) indent = m[1];
            }
        }

        type Hit = {
            key: string;
            valueFrom: number;
            valueTo: number;
            lineFrom: number;
            lineTo: number;
        };
        const hits = new Map<string, Hit>();

        // Scan lines between top-level braces to find existing $ fields at the start of a line
        let pos = openIdx + 1;
        while (pos < closeIdx) {
            const lineEnd = s.indexOf('\n', pos);
            const end = lineEnd === -1 ? closeIdx : Math.min(lineEnd, closeIdx);
            const lineFrom = pos;
            const lineTo = end;
            const line = s.slice(lineFrom, lineTo);
            const trimmed = line.trimStart();
            const leading = line.length - trimmed.length;
            if (leading >= indent.length && trimmed.startsWith('$')) {
                const keyMatch = trimmed.match(/^(\$id|\$createdAt|\$updatedAt)\s*:\s*/);
                if (keyMatch) {
                    const key = keyMatch[1];
                    const valStartRel = keyMatch[0].length;
                    const absValStart = lineFrom + leading + valStartRel;
                    // Find value end on this line (up to comma or end brace)
                    let absValEnd = absValStart;
                    if (s[absValStart] === '"' || s[absValStart] === "'") {
                        const quote = s[absValStart];
                        let i = absValStart + 1;
                        while (i < lineTo) {
                            const ch = s[i];
                            if (ch === '\\') {
                                i += 2;
                                continue;
                            }
                            if (ch === quote) {
                                absValEnd = i + 1;
                                break;
                            }
                            i++;
                        }
                        if (absValEnd === absValStart) {
                            // fallback: to line end
                            absValEnd = lineTo;
                        }
                    } else {
                        // number/bool/null until comma or end
                        let i = absValStart;
                        while (i < lineTo && !/[,}]/.test(s[i])) i++;
                        absValEnd = i;
                    }
                    hits.set(key, {
                        key,
                        valueFrom: absValStart,
                        valueTo: absValEnd,
                        lineFrom,
                        lineTo
                    });
                }
            }
            if (lineEnd === -1 || end === closeIdx) break;
            pos = end + 1;
        }

        const changes: { from: number; to: number; insert: string }[] = [];

        // Replace existing values; skip created/updated if we plan to move them to bottom
        const willMoveBottom = hits.has('$createdAt') || hits.has('$updatedAt');
        for (const { key, text } of want) {
            if (willMoveBottom && (key === '$createdAt' || key === '$updatedAt')) continue;
            const hit = hits.get(key);
            if (hit) {
                const current = s.slice(hit.valueFrom, hit.valueTo).trim();
                if (current !== text) {
                    changes.push({ from: hit.valueFrom, to: hit.valueTo, insert: text });
                }
            }
        }

        // If createdAt/updatedAt exist (or even if one is missing), ensure they are bottom-most in order
        if (willMoveBottom) {
            // Collect bottom two top-level property keys
            const keysBottom: string[] = [];
            let ln = doc.lineAt(closeIdx).number - 1;
            while (ln > 0 && keysBottom.length < 2) {
                const L = doc.line(ln);
                const txt = L.text;
                const trimmed = txt.trim();
                if (trimmed.length && trimmed !== '}') {
                    const m = txt.match(/^(\s+)([A-Za-z_$][A-Za-z0-9_$]*)\s*:/);
                    if (m && m[1].length >= indent.length) {
                        keysBottom.push(m[2]);
                    }
                }
                ln--;
            }
            const atBottom =
                keysBottom.length >= 2 &&
                keysBottom[1] === '$createdAt' &&
                keysBottom[0] === '$updatedAt';

            if (!atBottom) {
                // Remove any existing created/updated lines completely (include trailing newline)
                for (const k of ['$createdAt', '$updatedAt'] as const) {
                    const hit = hits.get(k);
                    if (!hit) continue;
                    let to = hit.lineTo;
                    if (to < s.length && s[to] === '\n') to = to + 1;
                    changes.push({ from: hit.lineFrom, to, insert: '' });
                }

                // Ensure the current last property (before close) ends with a comma
                const lastPropLine = doc.lineAt(closeIdx).number - 1;
                if (lastPropLine > 0) {
                    const L = doc.line(lastPropLine);
                    const txt = L.text;
                    if (txt.trim().length && !/,\s*$/.test(txt)) {
                        changes.push({ from: L.to, to: L.to, insert: ',' });
                    }
                }

                // Insert createdAt/updatedAt at bottom in order, using preserved values
                const createdTxt = want.find((w) => w.key === '$createdAt')!.text;
                const updatedTxt = want.find((w) => w.key === '$updatedAt')!.text;
                const prefixNL = s[closeIdx - 1] === '\n' ? '' : '\n';
                const bottomInsert = `${prefixNL}${indent}$createdAt: ${createdTxt},\n${indent}$updatedAt: ${updatedTxt},\n`;
                changes.push({ from: closeIdx, to: closeIdx, insert: bottomInsert });
            }
        }

        // Insert missing $id at top (timestamps handled by bottom move block)
        {
            const missing = want.filter(({ key }) => !hits.has(key));
            const insertId = missing.find((m) => m.key === '$id');
            if (insertId) {
                const firstLineEnd = s.indexOf('\n', openIdx);
                const insertTopAt = firstLineEnd === -1 ? openIdx + 1 : firstLineEnd + 1;
                const toInsertTop = `${indent}$id: ${insertId.text},\n`;
                changes.push({ from: insertTopAt, to: insertTopAt, insert: toInsertTop });
            }
        }

        if (!changes.length) return false;

        isUpdatingFromEditor = true;
        view.dispatch({ changes, userEvent: 'appwrite:systemPatch' });
        queueMicrotask(() => (isUpdatingFromEditor = false));
        return true;
    }

    // Transaction filter to prevent edits on system key lines
    function readOnlyRangesFilter(tr: Transaction) {
        if (readonly || !tr.docChanged) return tr;
        const ue = tr.annotation(Transaction.userEvent);
        if (typeof ue === 'string' && ue.startsWith('appwrite:')) {
            return tr;
        }

        const startDoc = tr.startState.doc;
        const readOnlyRanges = tr.startState.field(readOnlyRangesField);
        let blocked = false;
        let fullReplace = false;

        tr.changes.iterChanges((fromA: number, toA: number) => {
            // Allow full-document replacement (Select All → Paste)
            if (fromA === 0 && toA === startDoc.length) {
                fullReplace = true;
                return;
            }

            // Check if change overlaps with any read-only range
            for (const range of readOnlyRanges) {
                if (
                    // treat line ranges as half-open [from, to)
                    (fromA >= range.from && fromA < range.to) ||
                    (toA > range.from && toA < range.to) ||
                    (fromA < range.from && toA > range.to)
                ) {
                    blocked = true;
                    break;
                }
            }
        });

        if (fullReplace) return tr;
        // Block the transaction if it tries to edit a read-only range
        return blocked ? [] : tr;
    }

    // Ranges field for read-only system lines (single source of truth)
    const readOnlyRangesField = StateField.define<ReadonlyArray<{ from: number; to: number }>>({
        create(state) {
            return findReadOnlyRanges(state.doc);
        },
        update(value, tr) {
            if (!tr.docChanged) return value;
            return findReadOnlyRanges(tr.state.doc);
        }
    });

    // State field to add decorations to read-only lines
    const readOnlyLineField = StateField.define<DecorationSet>({
        create(state) {
            const decorations: Range<Decoration>[] = [];
            const readOnlyRanges = state.field(readOnlyRangesField);

            for (const range of readOnlyRanges) {
                decorations.push(
                    Decoration.line({
                        class: 'cm-readOnlyLine'
                    }).range(range.from)
                );
            }

            return Decoration.set(decorations);
        },
        update(decorations, tr) {
            if (!tr.docChanged) return decorations;

            const newDecorations: Range<Decoration>[] = [];
            const readOnlyRanges = tr.state.field(readOnlyRangesField);

            for (const range of readOnlyRanges) {
                newDecorations.push(
                    Decoration.line({
                        class: 'cm-readOnlyLine'
                    }).range(range.from)
                );
            }

            return Decoration.set(newDecorations);
        },
        provide: (f) => EditorView.decorations.from(f)
    });

    // ViewPlugin to highlight nested keys (4+ spaces) only in visible ranges
    const nestedKeyPlugin = ViewPlugin.fromClass(
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

    // Safe parse variant that indicates success without mutating editor on failure
    async function tryParseEditorContent(
        content: string
    ): Promise<{ ok: boolean; value: JsonValue }> {
        try {
            const value = await parse<JsonValue>(content);
            return { ok: true, value };
        } catch {
            /* empty */
        }

        return { ok: false, value: data };
    }

    // JavaScript linter to validate syntax (JSON5-based; precise squiggle when errorInPlace)
    async function javascriptLinter(view: { state: { doc: Text } }): Promise<Diagnostic[]> {
        if (isUpdatingFromEditor) return [];
        const content = view.state.doc.toString();
        try {
            await parse(content);
            errorMessage = null;
            return [];
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            errorMessage = errorMsg;
            const diags = (error && 'diagnostics' in error ? error.diagnostics : undefined) as
                | { from: number; to: number }[]
                | undefined;
            if (diags && diags.length && errorInPlace) {
                const { from, to } = diags[0];
                return [{ from, to, severity: 'error', message: errorMsg }];
            }
            // Fallback to full-doc underline
            return [{ from: 0, to: content.length, severity: 'error', message: errorMsg }];
        }
    }

    // Handle save logic - called from both button and keyboard shortcut
    async function handleSave(): Promise<void> {
        if (!hasDataChanged) return;

        isSaving = true;

        let dataToSave = data;
        if (isNew && typeof data === 'object' && data !== null && !Array.isArray(data)) {
            const dataObj = data;
            if (!dataObj['$id']) {
                dataToSave = { $id: generatedId, ...dataObj };
            }
        }

        await onSave?.(dataToSave);
        isSaving = false;
    }

    onMount(() => {
        if (!editorContainer) return;

        const initialContent = dataToString(data);
        lastExpectedContent = initialContent;

        baseExtensions = [
            lineNumbers(),
            highlightActiveLine(),
            highlightActiveLineGutter(),
            // Use fold gutter, hide default glyphs (we style via CSS)
            foldGutter({ openText: ' ', closedText: ' ' }),
            indentUnit.of('  '), // Use 2 spaces for indentation
            indentOnInput(),
            history(),
            bracketMatching(),
            closeBrackets(),
            linter(javascriptLinter, { delay: LINTER_DELAY }),
            readOnlyRangesField,
            EditorState.transactionFilter.of(readOnlyRangesFilter),
            readOnlyLineField,
            nestedKeyPlugin,
            highlightSelectionMatches(),
            // Clear selection after fold/unfold to prevent split highlighting
            EditorView.updateListener.of((update) => {
                if (update.transactions.some((tr) => tr.effects.some((e) => e.is(foldEffect)))) {
                    const sel = update.state.selection.main;
                    if (!sel.empty) {
                        update.view.dispatch({
                            selection: EditorSelection.cursor(sel.head)
                        });
                    }
                }
            }),
            // Override Enter and Shift-Enter to keep current indent, no extra +indentUnit
            keymap.of(
                createEditorKeymaps(insertNewlineKeepIndent, ctrlSave ? handleSave : undefined)
            ),
            keymap.of(secondaryKeymaps),
            javascript(),
            customSyntaxHighlighting,
            customTheme,
            wrapCompartment.of(wrapLines ? EditorView.lineWrapping : []),
            EditorView.updateListener.of((update) => {
                if (!update.docChanged || readonly) return;
                // First, expand `: {}` / `: []` patterns when they appear
                if (!isUpdatingFromEditor && maybeExpandEmptyLiteral(update)) {
                    return;
                }
                if (isUpdatingFromEditor) return;

                // Record if this transaction was a full-document replacement (paste-all)
                update.changes.iterChanges((fromA: number, toA: number) => {
                    if (fromA === 0 && toA === update.startState.doc.length) {
                        pendingCanonicalize = true;
                    }
                });

                // Debounce parse + onChange work
                if (changeTimer) {
                    clearTimeout(changeTimer);
                    changeTimer = null;
                }

                changeTimer = setTimeout(async () => {
                    const state = update.view.state;
                    const newContent = state.doc.toString();
                    const res = await tryParseEditorContent(newContent);
                    if (!res.ok) {
                        return; // linter will surface the error
                    }

                    const parsed = preserveSystemValues(res.value);

                    if (pendingCanonicalize) {
                        // Patch only top-level $ system fields in-place to avoid reflow
                        applySystemFieldsPatch(update.view, state.doc, parsed);
                        pendingCanonicalize = false;
                    }

                    data = parsed;
                    onChange?.(parsed);
                    lastExpectedContent = dataToString(parsed);
                }, DEBOUNCE_DELAY);
            }),
            readOnlyCompartment.of(EditorState.readOnly.of(readonly))
        ];

        const startState = EditorState.create({
            doc: initialContent,
            extensions: baseExtensions
        });

        editorView = new EditorView({
            state: startState,
            parent: editorContainer
        });
    });

    onDestroy(() => {
        if (changeTimer) {
            clearTimeout(changeTimer);
            changeTimer = null;
        }
        editorView?.destroy();
        editorView = null;
    });

    // Reset originalData when transitioning to new document mode
    $effect(() => {
        if (isNew && !wasNew) {
            originalData = $state.snapshot(data);
            generatedId = ID.unique();
        }
        wasNew = isNew;
    });

    // Update originalData and editor when data or document changes externally
    $effect(() => {
        if (!editorView) return;

        // Detect document switch
        if (documentId !== lastDocId) {
            lastDocId = documentId;

            // For existing documents only:
            // capture snapshot and reset editor state/history
            if (!isNew) {
                // Capture original data snapshot when switching documents
                originalData = $state.snapshot(data);
                const expected = dataToString(data);

                lastExpectedContent = expected;

                if (changeTimer) {
                    clearTimeout(changeTimer);
                    changeTimer = null;
                }

                pendingCanonicalize = false;
                isUpdatingFromEditor = true;

                const newState = EditorState.create({ doc: expected, extensions: baseExtensions });
                editorView.setState(newState);
                queueMicrotask(() => (isUpdatingFromEditor = false));
                return;
            }
        }

        // Only react when the external data actually changed
        const expectedContent = dataToString(data);
        if (expectedContent === lastExpectedContent) return;
        lastExpectedContent = expectedContent;

        const currentContent = editorView.state.doc.toString();
        if (currentContent !== expectedContent) {
            isUpdatingFromEditor = true;
            editorView.dispatch({
                changes: { from: 0, to: currentContent.length, insert: expectedContent },
                annotations: [Transaction.addToHistory.of(false)]
            });
            queueMicrotask(() => (isUpdatingFromEditor = false));
        }
    });

    // React to read-only prop changes via Compartment reconfigure
    // Also make editor read-only while saving to prevent concurrent edits
    $effect(() => {
        if (!editorView) return;
        editorView.dispatch({
            effects: readOnlyCompartment.reconfigure(EditorState.readOnly.of(readonly || isSaving))
        });
    });

    // React to wrapLines prop changes via Compartment reconfigure
    $effect(() => {
        if (!editorView) return;
        editorView.dispatch({
            effects: wrapCompartment.reconfigure(wrapLines ? EditorView.lineWrapping : [])
        });
    });
</script>

<div class="editor-container">
    <div class="editor-header">
        {#if loading}
            <Skeleton variant="line" height="12px" width="143px" />
        {:else}
            <Layout.Stack direction="row">
                {#if documentId}
                    <div class="id-tag-button-wrapper">
                        <Id value={documentId} tooltipPlacement="top">{truncateId(documentId)}</Id>
                    </div>
                {/if}
            </Layout.Stack>

            {#if errorMessage && !$isSmallViewport}
                <div class="editor-header">
                    <span class="error-message">{errorMessage}</span>
                </div>
            {/if}

            {#if documentId}
                <Layout.Stack direction="row" inline gap="s">
                    <Tooltip placement="top" disabled={!hasDataChanged}>
                        <Button
                            icon
                            secondary
                            size="xs"
                            disabled={!hasDataChanged}
                            class="icon-button"
                            on:click={handleSave}>
                            {#if isSaving}
                                <Spinner size="s" />
                            {:else}
                                <Icon icon={IconCheck} size="s" />
                            {/if}
                        </Button>

                        <span slot="tooltip">Save</span>
                    </Tooltip>

                    <Tooltip placement="top">
                        <Button
                            icon
                            secondary
                            size="xs"
                            class="icon-button"
                            on:click={async () => {
                                await copy(JSON.stringify(data, null, 2));
                                tooltipMessage = 'Copied';
                                setTimeout(() => (tooltipMessage = 'Copy document'), 1000);
                            }}>
                            <Icon icon={IconDuplicate} size="s" />
                        </Button>

                        <span slot="tooltip">{tooltipMessage}</span>
                    </Tooltip>
                </Layout.Stack>
            {/if}
        {/if}
    </div>

    {#if errorMessage && $isSmallViewport}
        <div class="editor-header mobile" transition:slide={{ duration: 150 }}>
            <Typography.Caption variant="500" color="--fgcolor-neutral-primary"
                >{errorMessage}</Typography.Caption>
        </div>
    {/if}

    {#if loading}
        <div class="cm-editor-skeleton">
            <div class="cm-gutters-skeleton">
                {#each Array.from({ length: 16 }) as _, index (index)}
                    <div class="cm-gutter-skeleton-line">{index + 1}</div>
                {/each}
            </div>
            <div class="cm-content-skeletons">
                {#each SKELETON_LINES as line}
                    <div
                        style:min-height="16px"
                        style={line.indent > 0 ? `margin-inline-start: ${line.indent}px;` : ''}>
                        <Skeleton
                            variant="line"
                            height="14px"
                            width={`${line.width}px`}
                            style="opacity: 0.5;" />
                    </div>
                {/each}
            </div>
        </div>
    {:else}
        <div bind:this={editorContainer} class="cm-editor-wrapper"></div>
    {/if}
</div>

<style lang="scss">
    .editor-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
    }

    .cm-editor-skeleton {
        display: flex;
        flex: 1;
        background-color: var(--bgcolor-neutral-primary);
        overflow: hidden;
    }

    .cm-gutters-skeleton {
        display: flex;
        padding: 4px;
        min-width: 38px;
        flex-shrink: 0;
        font-size: 13px;
        line-height: 21px;
        user-select: none;
        max-height: 17px;
        flex-direction: column;
        font-family: var(--font-family-code);
        color: var(--fgcolor-neutral-tertiary);
        background-color: var(--bgcolor-neutral-primary);
    }

    .cm-gutter-skeleton-line {
        text-align: right;
        padding-right: 8px;
    }

    .cm-content-skeletons {
        gap: 5px;
        flex: 1;
        padding: 8px;
        display: flex;
        max-height: 21px;
        flex-direction: column;
    }

    .editor-header {
        display: flex;
        align-items: center;
        gap: var(--space-8);
        height: 40px;
        padding: 0 var(--space-4);
        background: var(--bgcolor-neutral-secondary);
        border-bottom: 1px solid var(--border-neutral);
        flex-shrink: 0;

        &.mobile {
            background: var(--bgcolor-error);
        }

        .error-message {
            color: var(--fgcolor-error);
            font-family: var(--font-family-code);
            font-size: 13px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
        }

        :global(.icon-button),
        :global(.id-tag-button-wrapper button) {
            border: var(--border-width-S, 1px) solid var(--border-neutral-strong, #414146);
        }
    }

    .cm-editor-wrapper {
        flex: 1;
        overflow: auto;

        :global(.cm-editor) {
            height: 100%;
            background-color: var(--bgcolor-neutral-primary);
            color: var(--fgcolor-neutral-primary);
        }

        :global(.cm-scroller) {
            overflow: auto;
        }

        :global(.cm-gutters) {
            background-color: var(--bgcolor-neutral-primary);
            color: var(--fgcolor-neutral-tertiary);
            border: none;
        }

        // Custom fold gutter chevrons using provided SVG
        :global(.cm-foldGutter .cm-gutterElement) {
            color: transparent; /* hide default markers */
            display: flex;
            align-items: center;
            cursor: pointer;
            justify-content: center;
        }

        // Only show chevron when there's actual content to fold
        :global(.cm-foldGutter .cm-gutterElement:not(:empty)::before) {
            content: '';
            width: 12px;
            height: 12px;
            background-color: var(--fgcolor-neutral-secondary);
            /* use mask so color comes from CSS variable */
            -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3.17574 4.37569C3.41005 4.14137 3.78995 4.14137 4.02426 4.37569L6 6.35142L7.97574 4.37569C8.21005 4.14137 8.58995 4.14137 8.82426 4.37569C9.05858 4.61 9.05858 4.9899 8.82426 5.22422L6.42426 7.62422C6.18995 7.85853 5.81005 7.85853 5.57574 7.62422L3.17574 5.22422C2.94142 4.9899 2.94142 4.61 3.17574 4.37569Z' fill='%23000'/%3E%3C/svg%3E")
                no-repeat center / contain;
            mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M3.17574 4.37569C3.41005 4.14137 3.78995 4.14137 4.02426 4.37569L6 6.35142L7.97574 4.37569C8.21005 4.14137 8.58995 4.14137 8.82426 4.37569C9.05858 4.61 9.05858 4.9899 8.82426 5.22422L6.42426 7.62422C6.18995 7.85853 5.81005 7.85853 5.57574 7.62422L3.17574 5.22422C2.94142 4.9899 2.94142 4.61 3.17574 4.37569Z' fill='%23000'/%3E%3C/svg%3E")
                no-repeat center / contain;
            transition: transform 250ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        // Default state - expanded (shows "Fold line"), chevron points down
        :global(.cm-foldGutter .cm-gutterElement:has(span[title*='Fold'])::before) {
            transform: rotate(0deg);
        }

        // Collapsed state (shows "Unfold line"), chevron points right
        :global(.cm-foldGutter .cm-gutterElement:has(span[title*='Unfold'])::before) {
            transform: rotate(-90deg);
        }

        :global(.cm-content) {
            caret-color: var(--fgcolor-neutral-primary);
        }

        :global(.cm-cursor) {
            border-left-color: var(--fgcolor-neutral-primary);
        }

        // Active line highlight
        :global(.cm-activeLine) {
            background-color: var(--overlay-neutral-pressed) !important;
        }

        :global(.cm-activeLineGutter) {
            background-color: var(--overlay-neutral-pressed) !important;
        }

        // Subtle indicator for read-only system-field lines
        :global(.cm-readOnlyLine) {
            cursor: not-allowed;
        }

        // Nested keys color override
        :global(.cm-nestedPropertyName) {
            color: var(--web-orange-500, #fe7c43) !important;
        }
        :global(.cm-nestedPropertyName .cm-propertyName) {
            color: var(--web-orange-500, #fe7c43) !important;
        }

        // Syntax highlighting
        // Property names (keys) must use neutral color with priority
        :global(.cm-propertyName) {
            color: var(--fgcolor-neutral-primary) !important;
            font-weight: 500;
        }

        // All value-level tokens use mint color (strings, numbers, etc.)
        :global(.cm-string) {
            color: var(--brand-mint-600);
        }

        // Escape sequences in strings should also be mint colored
        :global(.cm-string .cm-escape),
        :global(.cm-escape) {
            color: var(--brand-mint-600);
        }

        :global(.cm-number:not(.cm-propertyName)) {
            color: var(--brand-mint-600);
        }

        :global(.cm-bool) {
            color: var(--brand-mint-600);
        }

        :global(.cm-null) {
            color: var(--brand-mint-600);
            font-style: italic;
        }

        // Structure tokens use neutral color
        :global(.cm-punctuation),
        :global(.cm-bracket) {
            color: var(--fgcolor-neutral-primary);
        }

        :global(.cm-selectionBackground) {
            background-color: var(--bgcolor-brand-primary) !important;
        }

        :global(.cm-focused .cm-selectionBackground) {
            background-color: var(--bgcolor-brand-primary) !important;
        }

        // Linter styles
        :global(.cm-diagnostic) {
            padding: 3px 6px;
            margin-left: -6px;
            border-radius: 2px;
        }

        :global(.cm-diagnostic-error) {
            background-color: rgba(255, 0, 0, 0.1);
            border-left: 3px solid var(--fgcolor-error);
        }

        :global(.cm-diagnostic-warning) {
            background-color: rgba(255, 165, 0, 0.1);
            border-left: 3px solid var(--fgcolor-warning);
        }

        // Smooth curved underline for errors
        :global(.cm-lintRange-error) {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='3' viewBox='0 0 4 3'%3E%3Cpath d='M0 3 Q 1 0 2 3 Q 3 0 4 3' fill='none' stroke='%23f04438' stroke-width='0.6'/%3E%3C/svg%3E");
            background-repeat: repeat-x;
            background-position: left bottom;
            padding-bottom: 2px;
        }

        :global(.cm-lintRange-warning) {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='3' viewBox='0 0 4 3'%3E%3Cpath d='M0 3 Q 1 0 2 3 Q 3 0 4 3' fill='none' stroke='%23ffa500' stroke-width='0.6'/%3E%3C/svg%3E");
            background-repeat: repeat-x;
            background-position: left bottom;
            padding-bottom: 2px;
        }

        // Hide lint tooltip since we show errors in header
        :global(.cm-tooltip.cm-tooltip-lint),
        :global(.cm-tooltip-lint),
        :global([class*='cm-tooltip'][class*='lint']) {
            display: none !important;
            visibility: hidden !important;
            opacity: 0 !important;
            pointer-events: none !important;
        }

        :global(.cm-foldPlaceholder) {
            border: unset;
            padding: 0 4px;
            background: var(--bgcolor-neutral-secondary);
        }
    }
</style>
