<script lang="ts" module>
    export type JsonValue = string | number | boolean | null | JsonObject | JsonArray | object;
    export type JsonObject = { [key: string]: JsonValue };
    export type JsonArray = JsonValue[];

    type Hit = {
        key: string;
        valueFrom: number;
        valueTo: number;
        lineFrom: number;
        lineTo: number;
    };
</script>

<script lang="ts">
    import {
        EditorView,
        keymap,
        lineNumbers,
        highlightActiveLine,
        highlightActiveLineGutter,
        type ViewUpdate
    } from '@codemirror/view';
    import { history, undo } from '@codemirror/commands';
    import {
        bracketMatching,
        foldGutter,
        foldEffect,
        foldAll,
        unfoldAll,
        indentOnInput,
        indentUnit
    } from '@codemirror/language';
    import { highlightSelectionMatches } from '@codemirror/search';
    import { closeBrackets } from '@codemirror/autocomplete';
    import { forEachDiagnostic, type Diagnostic, linter } from '@codemirror/lint';
    import {
        EditorState,
        EditorSelection,
        Transaction,
        Compartment,
        type Extension
    } from '@codemirror/state';
    import type { Text as CmText } from '@codemirror/state';
    import { onMount, onDestroy } from 'svelte';
    import Id, { truncateId } from '$lib/components/id.svelte';
    import { Icon, Layout, Skeleton, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import { Button } from '$lib/elements/forms';
    import { copy } from '$lib/helpers/copy';
    import { isSmallViewport } from '$lib/stores/viewport';

    import { makeErrorMessage } from './helpers/errorMessages';
    import { customTheme, customSyntaxHighlighting } from './helpers/theme';
    import { createEditorKeymaps, secondaryKeymaps } from './helpers/keymaps';
    import {
        createReadOnlyRangesField,
        createReadOnlyLineField,
        createReadOnlyRangesFilter,
        createNestedKeyPlugin,
        createDuplicateKeyLinter,
        createSystemFieldStylePlugin,
        createLineHoverPlugin,
        createErrorLineHighlight
    } from './extensions';
    import {
        ALLOWED_DOLLAR_PROPS,
        DEBOUNCE_DELAY,
        LINTER_DELAY,
        INDENT_REGEX,
        SCALAR_VALUE_REGEX,
        TRAILING_COMMA_REGEX,
        WHITESPACE_REGEX,
        WHITESPACE_ONLY_REGEX,
        SKELETON_LINES,
        getIndent,
        SAVE_UNDO_TOOLBAR_TIMEOUT
    } from './helpers/constants';
    import { ID } from '@appwrite.io/console';
    import { sleep } from '$lib/helpers/promises';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Suggestions, Error as ErrorSonner, Save as SavingSonner } from '../sonners';
    import { json5, json5ParseCache, json5ParseLinter } from 'codemirror-json5';
    import { SvelteMap } from 'svelte/reactivity';

    interface Props {
        isNew?: boolean;
        data?: JsonValue;
        isSaving?: boolean;
        loading?: boolean;
        onChange?: (newData: JsonValue, hasChanged: boolean) => Promise<void> | void;
        onSave?: (newData: JsonValue) => Promise<void> | void;
        onCancel?: () => void;
        readonly?: boolean;
        wrapLines?: boolean;
        errorInPlace?: boolean;
        ctrlSave?: boolean;
        showHeaderActions?: boolean;
        showSuggestions?: boolean;
        suggestedAttributes?: string[];
        showMockSuggestions?: boolean;
    }

    let {
        isNew = false,
        data = $bindable(),
        onChange,
        onSave,
        onCancel,
        isSaving = $bindable(false),
        loading = false,
        readonly = false,
        wrapLines = true,
        errorInPlace = true,
        ctrlSave = false,
        showHeaderActions = true,
        showSuggestions = false,
        suggestedAttributes = [],
        showMockSuggestions = false
    }: Props = $props();

    let editorContainer: HTMLDivElement = $state(null);

    let editorView: EditorView | null = null;
    let errorMessage = $state<string | null>(null);
    let warningMessage = $state<string | null>(null);
    let changeTimer: ReturnType<typeof setTimeout> | null = null; // debounce timer for parse + onChange
    let tooltipTimer: ReturnType<typeof setTimeout> | null = null; // timer for tooltip message reset
    let pendingCanonicalize = false; // set when a full-document replace (paste-all) occurs
    let lastExpectedContent = ''; // track latest serialized data to avoid spurious rewrites
    let lastDocId: string | null = null; // track current document identity for history reset
    let baseExtensions: Extension[] = []; // cached extension set to rebuild state on doc switch

    let saveSonnerState: 'saving' | 'saved' | null = $state(null);

    let hasUserContent = $state(false);
    let hasStartedEditing = $state(false);
    let hasSuggestionsBeenShown = $state(false); // Track if suggestions were already shown for this document

    const wrapCompartment = new Compartment();
    const readOnlyCompartment = new Compartment();

    let tooltipMessage = $state('Copy document');

    // Store the original data to preserve system values
    let originalData = $state<JsonValue>(data);

    // Check if the update is from editor
    let isUpdatingFromEditor = false;

    // Track previous isNew state to detect transitions
    let wasNew = isNew;

    // Generate a stable ID once for new documents
    let generatedId = $state(ID.unique());

    // Serialized data cache
    let lastSerializedText = '';
    let originalSerialized = $state('');
    let lastSerializedData: JsonValue | null = null;

    // Get $id from data
    const documentId = $derived(
        data && typeof data === 'object' && !Array.isArray(data) && '$id' in data && data.$id
            ? String(data.$id)
            : generatedId
    );

    // Check for enable, disable save button.
    const hasDataChanged = $derived.by(() => {
        // Fast path: reference equality
        if (data === originalData) return false;

        // Compare current data
        return serializeData(data) !== originalSerialized;
    });

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

            if (isNew && !hasUserContent && sortedEntries[0]?.[0] === '$id') {
                props.splice(1, 0, `${indentStr}  `);
            }

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

    function serializeData(value: JsonValue): string {
        if (value === lastSerializedData) {
            return lastSerializedText;
        }

        const serialized = dataToString(value);
        lastSerializedData = value;
        lastSerializedText = serialized;
        return serialized;
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

    // Check if line is a valid key for auto-completion
    function isValidKeyForAutoComplete(lineText: string, cursorOffset: number): boolean {
        // skip system fields (starting with $)
        if (lineText.trimStart().startsWith('$')) return false;

        // pattern: key name followed by colon at end
        const beforeCursor = lineText.slice(0, cursorOffset);
        const match = /([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*$/.exec(beforeCursor);
        return match !== null;
    }

    // Check if line already has completion artifacts
    function lineHasCompletion(lineText: string, cursorOffset: number): boolean {
        const afterCursor = lineText.slice(cursorOffset);
        return afterCursor.includes('"') || afterCursor.includes(',');
    }

    function isPasteTransaction(tr: Transaction): boolean {
        return tr.annotation(Transaction.userEvent)?.startsWith('input.paste') ?? false;
    }

    function isPasteUpdate(update: ViewUpdate): boolean {
        return update.transactions.some(isPasteTransaction);
    }

    // Auto-complete key with empty string: `key:` -> `key: "",` with cursor between quotes
    function maybeAutoCompleteKeyValue(update: ViewUpdate): boolean {
        const doc = update.state.doc;
        let did = false;

        const isPaste = isPasteUpdate(update);
        if (isPaste) return false;

        update.changes.iterChanges(
            (fromA: number, toA: number, fromB: number, toB: number, inserted: CmText) => {
                if (did) return;

                // Only trigger on insertion (not deletion)
                if (toA >= fromA && toB <= fromB) return;

                // Check if `:` was just typed
                const insertedText = inserted.toString();
                if (!insertedText.endsWith(':')) return;

                const line = doc.lineAt(toB);
                const lineText = line.text;
                const cursorOffset = toB - line.from;

                // Validate line is suitable for auto-completion
                if (!isValidKeyForAutoComplete(lineText, cursorOffset)) return;
                if (lineHasCompletion(lineText, cursorOffset)) return;

                // Insert space, empty quotes, and comma
                const replacement = ' "",';
                const cursorPos = toB + 2; // Position cursor between the quotes

                update.view.dispatch({
                    changes: { from: toB, to: toB, insert: replacement },
                    selection: EditorSelection.cursor(cursorPos),
                    userEvent: 'input'
                });
                did = true;
            }
        );
        return did;
    }

    // Detect indentation from first line after opening brace
    function detectIndentation(content: string, openIdx: number, closeIdx: number): string {
        const afterOpenNL = content.indexOf('\n', openIdx);
        if (afterOpenNL === -1) return '  ';

        const lineStart = afterOpenNL + 1;
        const lineEnd =
            content.indexOf('\n', lineStart) === -1 ? closeIdx : content.indexOf('\n', lineStart);
        const line = content.slice(lineStart, lineEnd);
        const match = line.match(/^(\s+)/);

        return match ? match[1] : '  ';
    }

    // Helper to ensure $createdAt and $updatedAt are positioned at the bottom of the document
    function ensureTimestampsAtBottom(
        expectedFields: Array<{ key: '$id' | '$createdAt' | '$updatedAt'; text: string }>,
        hits: Map<string, Hit>,
        doc: CmText,
        content: string,
        closeIdx: number,
        indent: string
    ): Array<{ from: number; to: number; insert: string }> {
        const changes: Array<{ from: number; to: number; insert: string }> = [];

        const createdTxt = expectedFields.find((w) => w.key === '$createdAt')!.text;
        const updatedTxt = expectedFields.find((w) => w.key === '$updatedAt')!.text;

        // Collect bottom two top-level property keys
        const keysBottom: string[] = [];
        let ln = doc.lineAt(closeIdx).number - 1;
        while (ln > 0 && keysBottom.length < 2) {
            const L = doc.line(ln);
            const txt = L.text;
            const trimmed = txt.trim();
            if (trimmed.length && trimmed !== '}') {
                // Only match top-level keys: must start with exactly the top-level indent
                if (txt.startsWith(indent)) {
                    const m = txt.match(/^(\s+)([A-Za-z_$][A-Za-z0-9_$]*)\s*:/);
                    if (m) {
                        keysBottom.push(m[2]);
                    }
                }
            }
            ln--;
        }

        // Check if timestamps are already at the bottom in correct order
        const atBottom =
            keysBottom.length >= 2 &&
            keysBottom[1] === '$createdAt' &&
            keysBottom[0] === '$updatedAt';

        if (atBottom) {
            // Already positioned correctly, but check if values need updating
            const createdHit = hits.get('$createdAt');
            const updatedHit = hits.get('$updatedAt');

            if (createdHit) {
                const currentCreated = content
                    .slice(createdHit.valueFrom, createdHit.valueTo)
                    .trim();
                if (currentCreated !== createdTxt) {
                    changes.push({
                        from: createdHit.valueFrom,
                        to: createdHit.valueTo,
                        insert: createdTxt
                    });
                }
            }

            if (updatedHit) {
                const currentUpdated = content
                    .slice(updatedHit.valueFrom, updatedHit.valueTo)
                    .trim();
                if (currentUpdated !== updatedTxt) {
                    changes.push({
                        from: updatedHit.valueFrom,
                        to: updatedHit.valueTo,
                        insert: updatedTxt
                    });
                }
            }

            return changes;
        }

        // Remove any existing created/updated lines completely (include trailing newline)
        for (const k of ['$createdAt', '$updatedAt'] as const) {
            const hit = hits.get(k);
            if (!hit) continue;
            let to = hit.lineTo;
            if (to < content.length && content[to] === '\n') to = to + 1;
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
        const prefixNL = content[closeIdx - 1] === '\n' ? '' : '\n';
        const bottomInsert = `${prefixNL}${indent}$createdAt: ${createdTxt},\n${indent}$updatedAt: ${updatedTxt},\n`;
        changes.push({ from: closeIdx, to: closeIdx, insert: bottomInsert });

        return changes;
    }

    // Helper to insert missing $id field at the top of the document
    function createMissingIdInsertion(
        expectedFields: Array<{ key: '$id' | '$createdAt' | '$updatedAt'; text: string }>,
        hits: Map<string, Hit>,
        content: string,
        openIdx: number,
        indent: string
    ): { from: number; to: number; insert: string } | null {
        const missing = expectedFields.filter(({ key }) => !hits.has(key));
        const insertId = missing.find((m) => m.key === '$id');

        if (!insertId) return null;

        const firstLineEnd = content.indexOf('\n', openIdx);
        const insertTopAt = firstLineEnd === -1 ? openIdx + 1 : firstLineEnd + 1;
        const toInsertTop = `${indent}$id: ${insertId.text},\n`;

        return { from: insertTopAt, to: insertTopAt, insert: toInsertTop };
    }

    // Fast-path check: verify if system fields already match expected values
    // Returns true if all fields ($id, $createdAt, $updatedAt) found and match, false otherwise
    function checkSystemFieldsMatch(
        content: string,
        openIdx: number,
        closeIdx: number,
        indent: string,
        expectedFields: Array<{ key: '$id' | '$createdAt' | '$updatedAt'; text: string }>
    ): boolean {
        const FAST_CHECK_LINES = 20;
        const foundValues = new SvelteMap<string, string>();

        // Check first `FAST_CHECK_LINES` lines after opening brace for $id
        let checkPos = openIdx + 1;
        let linesChecked = 0;
        while (linesChecked < FAST_CHECK_LINES && checkPos < closeIdx) {
            const lineEnd = content.indexOf('\n', checkPos);
            const end = lineEnd === -1 ? closeIdx : Math.min(lineEnd, closeIdx);
            const line = content.slice(checkPos, end);

            // Only match top-level fields: must start with exactly the top-level indent
            if (line.startsWith(indent)) {
                const afterIndent = line.slice(indent.length);
                if (afterIndent.startsWith('$id')) {
                    const match = afterIndent.match(/^\$id\s*:\s*(.+?)(?:,|$)/);
                    if (match) {
                        foundValues.set('$id', match[1].trim());
                        break;
                    }
                }
            }

            if (lineEnd === -1 || end === closeIdx) break;
            checkPos = end + 1;
            linesChecked++;
        }

        // Check last `FAST_CHECK_LINES` lines before closing brace for $createdAt/$updatedAt
        const lines: string[] = [];
        let searchPos = closeIdx - 1;
        while (lines.length < FAST_CHECK_LINES && searchPos > openIdx) {
            const lineStart = content.lastIndexOf('\n', searchPos - 1);
            const start = lineStart === -1 ? openIdx + 1 : lineStart + 1;
            const lineContent = content.slice(start, searchPos + 1);
            lines.push(lineContent);
            searchPos = start - 2;
        }

        for (const line of lines) {
            // Only match top-level fields: must start with exactly the top-level indent
            if (!line.startsWith(indent)) continue;

            const afterIndent = line.slice(indent.length);
            if (afterIndent.startsWith('$createdAt')) {
                const createdMatch = afterIndent.match(/^\$createdAt\s*:\s*(.+?)(?:,|$)/);
                if (createdMatch) {
                    foundValues.set('$createdAt', createdMatch[1].trim());
                }
            }
            if (afterIndent.startsWith('$updatedAt')) {
                const updatedMatch = afterIndent.match(/^\$updatedAt\s*:\s*(.+?)(?:,|$)/);
                if (updatedMatch) {
                    foundValues.set('$updatedAt', updatedMatch[1].trim());
                }
            }
        }

        // If all 3 found and values match expected, return true
        if (foundValues.size === 3) {
            return expectedFields.every(({ key, text }) => foundValues.get(key) === text);
        }

        return false;
    }

    // In-place patch: ensure top-level $ system fields reflect originals without reformatting the whole doc
    function applySystemFieldsPatch(view: EditorView, doc: CmText, parsed: JsonValue): boolean {
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
        const obj = parsed as JsonObject;
        const expectedFields: Array<{ key: '$id' | '$createdAt' | '$updatedAt'; text: string }> = [
            { key: '$id', text: dataToString(obj.$id ?? null) },
            { key: '$createdAt', text: dataToString(obj.$createdAt ?? null) },
            { key: '$updatedAt', text: dataToString(obj.$updatedAt ?? null) }
        ];

        const content = doc.toString();
        const openIdx = content.indexOf('{');
        const closeIdx = content.lastIndexOf('}');
        if (openIdx === -1 || closeIdx === -1 || closeIdx <= openIdx) return false;

        const indent = detectIndentation(content, openIdx, closeIdx);

        // Fast path: check if system fields already match expected values
        if (checkSystemFieldsMatch(content, openIdx, closeIdx, indent, expectedFields)) {
            return false; // Early exit - values already correct
        }

        // Values differ or not all found - proceed with full scan
        const hits = new SvelteMap<string, Hit>();

        // Scan lines between top-level braces to find existing $ fields at the start of a line
        let pos = openIdx + 1;
        while (pos < closeIdx) {
            const lineEnd = content.indexOf('\n', pos);
            const end = lineEnd === -1 ? closeIdx : Math.min(lineEnd, closeIdx);
            const lineFrom = pos;
            const lineTo = end;
            const line = content.slice(lineFrom, lineTo);

            // Only match top-level fields: must start with exactly the top-level indent
            if (line.startsWith(indent)) {
                const afterIndent = line.slice(indent.length);
                if (afterIndent.startsWith('$')) {
                    const keyMatch = afterIndent.match(/^(\$id|\$createdAt|\$updatedAt)\s*:\s*/);
                    if (keyMatch) {
                        const key = keyMatch[1];
                        const valStartRel = keyMatch[0].length;
                        const absValStart = lineFrom + indent.length + valStartRel;
                        // Find value end on this line (up to comma or end brace)
                        let absValEnd = absValStart;
                        if (content[absValStart] === '"' || content[absValStart] === "'") {
                            const quote = content[absValStart];
                            let i = absValStart + 1;
                            while (i < lineTo) {
                                const ch = content[i];
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
                            while (i < lineTo && !/[,}]/.test(content[i])) i++;
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
            }
            if (lineEnd === -1 || end === closeIdx) break;
            pos = end + 1;
        }

        const changes: { from: number; to: number; insert: string }[] = [];

        // Replace existing values; skip timestamps as they're handled by ensureTimestampsAtBottom
        for (const { key, text } of expectedFields) {
            if (key === '$createdAt' || key === '$updatedAt') continue;
            const hit = hits.get(key);
            if (hit) {
                const current = content.slice(hit.valueFrom, hit.valueTo).trim();
                if (current !== text) {
                    changes.push({ from: hit.valueFrom, to: hit.valueTo, insert: text });
                }
            }
        }

        // Ensure createdAt/updatedAt are at the bottom with correct values
        const timestampChanges = ensureTimestampsAtBottom(
            expectedFields,
            hits,
            doc,
            content,
            closeIdx,
            indent
        );
        changes.push(...timestampChanges);

        // Insert missing $id at top (timestamps handled by bottom move block)
        const idInsertion = createMissingIdInsertion(
            expectedFields,
            hits,
            content,
            openIdx,
            indent
        );

        if (idInsertion) {
            changes.push(idInsertion);
        }

        if (!changes.length) return false;

        isUpdatingFromEditor = true;
        view.dispatch({ changes, userEvent: 'appwrite:systemPatch' });
        queueMicrotask(() => (isUpdatingFromEditor = false));
        return true;
    }

    // Create extension instances
    const readOnlyRangesField = createReadOnlyRangesField(isNew);
    const readOnlyLineField = createReadOnlyLineField(readOnlyRangesField);

    // Check if document has user-added content beyond system fields
    function hasCustomContent(parsed: JsonValue): boolean {
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return false;
        const keys = Object.keys(parsed as JsonObject);
        const systemKeys = new Set([
            '$id',
            '$createdAt',
            '$updatedAt',
            '$collectionId',
            '$databaseId',
            '$permissions'
        ]);
        return keys.some((key) => !systemKeys.has(key));
    }

    function getLintWarningSummary(state: EditorState): {
        message: string | null;
        hasWarning: boolean;
    } {
        let message: string | null = null;
        let count = 0;
        forEachDiagnostic(state, (diagnostic) => {
            if (diagnostic.severity === 'warning') {
                count += 1;
                if (!message) {
                    message = diagnostic.message;
                }
            }
        });
        if (count === 0) return { message: null, hasWarning: false };
        if (count === 1) return { message, hasWarning: true };
        return { message: 'Duplicate keys detected', hasWarning: true };
    }

    const baseJson5Linter = json5ParseLinter();

    function expandErrorRange(state: EditorState, diagnostic: Diagnostic): Diagnostic {
        if (diagnostic.severity !== 'error') return diagnostic;

        const line = state.doc.lineAt(diagnostic.from);
        const text = line.text;
        const colonIndex = text.indexOf(':');

        let from = line.from;
        let to = line.to;

        if (colonIndex !== -1) {
            let startOffset = colonIndex + 1;
            while (startOffset < text.length && /\s/.test(text[startOffset])) {
                startOffset += 1;
            }

            let endOffset = text.length;
            while (endOffset > 0 && /\s/.test(text[endOffset - 1])) {
                endOffset -= 1;
            }
            if (endOffset > 0 && text[endOffset - 1] === ',') {
                endOffset -= 1;
            }

            if (endOffset > startOffset) {
                from = line.from + startOffset;
                to = line.from + endOffset;
            }
        }

        if (to <= from) {
            return diagnostic;
        }

        return { ...diagnostic, from, to };
    }

    // JSON5 linter using the parse cache; preserves errorInPlace behavior.
    async function json5Linter(view: EditorView): Promise<Diagnostic[]> {
        if (isUpdatingFromEditor) return [];
        const result = await baseJson5Linter(view);
        if (!result.length) {
            errorMessage = null;
            return [];
        }

        const smartError = makeErrorMessage(view.state, result[0]);
        const errorMsg = smartError.hint
            ? `${smartError.message}: ${smartError.hint}`
            : smartError.message;
        errorMessage = errorMsg;
        if (errorInPlace) {
            return result.map((diagnostic, index) => {
                const expanded = expandErrorRange(view.state, diagnostic);
                if (index === 0 && diagnostic.severity === 'error') {
                    if (smartError.range) {
                        return {
                            ...expanded,
                            from: smartError.range.from,
                            to: smartError.range.to,
                            message: smartError.message
                        };
                    }
                    return { ...expanded, message: smartError.message };
                }
                return expanded;
            });
        }
        // Fallback to full-doc underline
        return [{ from: 0, to: view.state.doc.length, severity: 'error', message: errorMsg }];
    }

    // Apply suggested attributes to the document
    function applySuggestedAttributes() {
        if (!editorView || !isNew || suggestedAttributes.length === 0) {
            return;
        }

        // Create an object with suggested attributes as empty strings
        const suggestedObject: Record<string, string> = {};
        for (const attr of suggestedAttributes) {
            suggestedObject[attr] = '';
        }

        // Merge with existing data (keeping system fields)
        const updatedData = {
            ...(typeof data === 'object' && data !== null && !Array.isArray(data) ? data : {}),
            ...suggestedObject
        };

        // Update the data
        data = updatedData;
        hasUserContent = true;

        // Manually update the editor content
        const newContent = serializeData(updatedData);

        if (editorView) {
            // Save current cursor position
            const currentSelection = editorView.state.selection.main;
            const currentContent = editorView.state.doc.toString();

            editorView.dispatch({
                changes: { from: 0, to: currentContent.length, insert: newContent },
                selection: { anchor: currentSelection.anchor, head: currentSelection.head }
            });
        }

        // Hide the suggestions bar after applying
        hasStartedEditing = false;
        hasSuggestionsBeenShown = true;
    }

    // Handle save logic - called from both button and keyboard shortcut
    async function handleSave(): Promise<void> {
        if (!hasDataChanged) return;
        const parseCache = editorView?.state.field(json5ParseCache, false);
        if (parseCache?.err || errorMessage) return;
        if (editorView && getLintWarningSummary(editorView.state).hasWarning) return;

        isSaving = true;

        let dataToSave = data;
        if (isNew && typeof data === 'object' && data !== null && !Array.isArray(data)) {
            const dataObj = data;
            if (!dataObj['$id']) {
                dataToSave = { $id: generatedId, ...dataObj };
            }
        }

        await onSave?.(dataToSave);

        // update after save completes
        originalData = data;

        isSaving = false;
    }

    function handleUndo() {
        if (!editorView) return;
        undo(editorView);
    }

    onMount(() => {
        if (!editorContainer) return;

        const initialContent = serializeData(data);
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
            linter(json5Linter, { delay: LINTER_DELAY }),
            createErrorLineHighlight(),
            readOnlyRangesField,
            EditorState.transactionFilter.of(
                createReadOnlyRangesFilter(readOnlyRangesField, readonly)
            ),
            readOnlyLineField,
            createNestedKeyPlugin(),
            createDuplicateKeyLinter({ delay: LINTER_DELAY }),
            createSystemFieldStylePlugin(() => isNew && !hasUserContent),
            createLineHoverPlugin(),
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
            // Add Cmd+A for applying suggestions and Esc to hide
            keymap.of([
                {
                    key: 'Mod-=',
                    preventDefault: true,
                    run: unfoldAll
                },
                {
                    key: 'Mod-+',
                    preventDefault: true,
                    run: unfoldAll
                },
                {
                    key: 'Mod--',
                    preventDefault: true,
                    run: foldAll
                },
                {
                    key: 'Mod-a',
                    preventDefault: true,
                    run: () => {
                        if (showSuggestions && hasStartedEditing) {
                            applySuggestedAttributes();
                            return true;
                        }
                        return false;
                    }
                },
                {
                    key: 'Escape',
                    run: () => {
                        if (showSuggestions && hasStartedEditing) {
                            hasStartedEditing = false;
                            hasSuggestionsBeenShown = true;
                            return true;
                        }
                        return false;
                    }
                }
            ]),
            keymap.of(secondaryKeymaps),
            json5(),
            customSyntaxHighlighting,
            customTheme,
            EditorView.domEventHandlers({
                mousedown: () => {
                    if (isNew && showSuggestions && !hasSuggestionsBeenShown) {
                        hasStartedEditing = true;
                    }
                    return false;
                }
            }),
            wrapCompartment.of(wrapLines ? EditorView.lineWrapping : []),
            EditorView.updateListener.of((update) => {
                const hasNonHoverEffects = update.transactions.some((tr) => {
                    if (!tr.effects.length) return false;
                    return tr.annotation(Transaction.userEvent) !== 'appwrite:hover';
                });
                if (update.docChanged || hasNonHoverEffects) {
                    const summary = getLintWarningSummary(update.state);
                    warningMessage = summary.message;
                }
                if (!update.docChanged || readonly) return;

                // Hide saved sonner when user starts typing
                if (saveSonnerState === 'saved') {
                    saveSonnerState = null;
                }

                // Check if this is manual typing (not paste, undo, or programmatic)
                const isPaste = isPasteUpdate(update);
                const isManualInput = !isPaste && !isUpdatingFromEditor;

                if (isNew && isManualInput && !hasSuggestionsBeenShown) {
                    if (hasStartedEditing) {
                        hasStartedEditing = false;
                        hasSuggestionsBeenShown = true;
                    } else {
                        hasStartedEditing = true;
                    }

                    const parseCache = update.state.field(json5ParseCache, false);
                    if (!parseCache?.err && parseCache?.obj !== undefined) {
                        hasUserContent = hasCustomContent(parseCache.obj as JsonValue);
                    }
                }

                // First, auto-complete `key:` to `key: "",`
                if (!isUpdatingFromEditor && maybeAutoCompleteKeyValue(update)) {
                    return;
                }

                // Then, expand `: {}` / `: []` patterns when they appear
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
                    const parseCache = state.field(json5ParseCache, false);

                    if (!parseCache || parseCache.err || parseCache.obj === undefined) {
                        return; // linter will surface the error
                    }

                    const parsed = preserveSystemValues(parseCache.obj as JsonValue);

                    if (pendingCanonicalize) {
                        // Patch only top-level $ system fields in-place to avoid reflow
                        applySystemFieldsPatch(update.view, state.doc, parsed);
                        pendingCanonicalize = false;
                    }

                    data = parsed;
                    onChange?.(parsed, hasDataChanged);
                    lastExpectedContent = serializeData(parsed);
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
        if (tooltipTimer) {
            clearTimeout(tooltipTimer);
            tooltipTimer = null;
        }
        lastSerializedData = null;
        lastSerializedText = '';
        editorView?.destroy();
        editorView = null;
    });

    // Reset originalData when transitioning to new document mode
    $effect(() => {
        if (isNew && !wasNew) {
            originalData = data;
            generatedId = ID.unique();
            hasStartedEditing = false; // Reset editing flag for new document
            hasUserContent = false;
            hasSuggestionsBeenShown = false; // Reset suggestions shown flag for new document
        }
        wasNew = isNew;
    });

    // Update originalData and editor when data or document changes externally
    $effect(() => {
        if (!editorView) return;

        const expectedContent = serializeData(data);

        if (documentId !== lastDocId) {
            lastDocId = documentId;
            lastSerializedData = null;
            lastSerializedText = '';
            hasUserContent = false;
            hasSuggestionsBeenShown = false; // Reset suggestions shown flag when switching documents

            // Hide saved sonner when document is changed
            if (saveSonnerState === 'saved') {
                saveSonnerState = null;
            }

            // Capture original data snapshot when switching documents
            originalData = data;

            lastExpectedContent = expectedContent;

            if (changeTimer) {
                clearTimeout(changeTimer);
                changeTimer = null;
            }

            pendingCanonicalize = false;
            isUpdatingFromEditor = true;

            // Reset editor state and history for both new and existing documents
            const newState = EditorState.create({
                doc: expectedContent,
                extensions: baseExtensions
            });
            editorView.setState(newState);
            queueMicrotask(() => (isUpdatingFromEditor = false));
            return;
        }

        // Only react when the external data actually changed
        if (expectedContent === lastExpectedContent) return;
        lastExpectedContent = expectedContent;

        const currentContent = editorView.state.doc.toString();
        if (currentContent !== expectedContent) {
            if (!isUpdatingFromEditor && hasDataChanged) {
                return;
            }

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

    // Cache serialized data for improved comparison in `hasDataChanged`
    $effect(() => {
        originalSerialized = serializeData(originalData);
    });

    $effect(() => {
        if (isSaving) {
            saveSonnerState = 'saving';
        } else if (saveSonnerState === 'saving') {
            saveSonnerState = 'saved';
            sleep(SAVE_UNDO_TOOLBAR_TIMEOUT).then(() => {
                if (saveSonnerState === 'saved') {
                    saveSonnerState = null;
                }
            });
        }
    });
</script>

<div class="editor-container" class:loading>
    {#if showHeaderActions}
        <div class="editor-header">
            {#if loading}
                <Skeleton variant="line" height="12px" width="143px" />
            {/if}

            <Layout.Stack direction="row">
                {#if documentId && !loading}
                    <div class="id-tag-button-wrapper">
                        <Id value={documentId} tooltipPlacement="top">{truncateId(documentId)}</Id>
                    </div>
                {/if}
            </Layout.Stack>

            {#if documentId}
                <Layout.Stack direction="row" inline gap="s">
                    {#if isNew && onCancel}
                        <Button text size="xs" disabled={loading} on:click={onCancel}>
                            Cancel
                        </Button>
                    {/if}

                    <Button secondary size="xs" disabled={!hasDataChanged} on:click={handleSave}>
                        Save
                    </Button>

                    <Tooltip placement="top">
                        <Button
                            icon
                            secondary
                            size="xs"
                            class="icon-button"
                            disabled={loading}
                            on:click={async () => {
                                await copy(JSON.stringify(data, null, 2));
                                tooltipMessage = 'Copied';
                                if (tooltipTimer) {
                                    clearTimeout(tooltipTimer);
                                }

                                tooltipTimer = setTimeout(() => {
                                    tooltipMessage = 'Copy document';
                                    tooltipTimer = null;
                                }, 1000);
                            }}>
                            <Icon icon={IconDuplicate} size="s" />
                        </Button>

                        <span slot="tooltip">{tooltipMessage}</span>
                    </Tooltip>
                </Layout.Stack>
            {/if}
        </div>
    {/if}

    {#if loading}
        <div class="cm-editor-skeleton">
            <div class="cm-gutters-skeleton">
                {#each Array.from({ length: $isSmallViewport ? 14 : 16 }) as _, index (index)}
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
    {/if}

    <div bind:this={editorContainer} class="cm-editor-wrapper" class:loading></div>

    {#if ($isSmallViewport && showSuggestions) || (showSuggestions && hasStartedEditing)}
        <Suggestions
            show={showSuggestions}
            showMock={showMockSuggestions}
            onMobileClick={() => {
                showSuggestions = false;
                applySuggestedAttributes();
            }} />
    {/if}
</div>

{#if !loading && (errorMessage || warningMessage)}
    <ErrorSonner
        message={errorMessage ?? warningMessage}
        severity={errorMessage ? 'error' : 'warning'} />
{/if}

<SavingSonner state={saveSonnerState} onUndo={handleUndo} />

<style lang="scss">
    .editor-container {
        display: flex;
        height: 100%;
        overflow: hidden;
        flex-direction: column;
        position: relative;

        &.loading {
            overflow: visible;
        }
    }

    .cm-editor-skeleton {
        flex: 1;
        display: flex;
        background-color: var(--bgcolor-neutral-primary);
    }

    .cm-gutters-skeleton {
        display: flex;
        margin-top: 4px;
        padding: 4px;
        min-width: 38px;
        flex-shrink: 0;
        font-size: 13px;
        user-select: none;
        max-height: 17px;
        flex-direction: column;
        font-family: var(--font-family-code);
        color: var(--fgcolor-neutral-tertiary);
        background-color: var(--bgcolor-neutral-primary);
    }

    .cm-gutter-skeleton-line {
        min-width: 20px;
        font-size: 14px;
        text-align: right;
        white-space: nowrap;
        font-family: monospace;
        padding: 0 3px 0 5px;
    }

    .cm-content-skeletons {
        flex: 1;
        gap: 3.5px;
        padding: 8px;
        margin-top: 4px;
        display: flex;
        max-height: 80px;
        flex-direction: column;
    }

    .editor-header {
        height: 40px;
        display: flex;
        flex-shrink: 0;
        align-items: center;
        gap: var(--space-8);
        padding: 0 var(--space-4);
        background: var(--bgcolor-neutral-secondary);
        border-bottom: 1px solid var(--border-neutral);

        :global(.icon-button),
        :global(.id-tag-button-wrapper button) {
            border: var(--border-width-S, 1px) solid var(--border-neutral-strong, #414146);
        }
    }

    .cm-editor-wrapper {
        flex: 1;
        overflow: auto;

        &.loading {
            display: none;
        }

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

        :global(.cm-hovered-line) {
            background-color: var(--overlay-neutral-hover);
        }

        :global(.cm-gutterElement.cm-hovered-lineGutter) {
            background-color: var(--overlay-neutral-hover);
        }

        :global(.cm-line.cm-error-line) {
            background-color: var(--bgcolor-error-weak) !important;
        }

        :global(.cm-gutterElement.cm-error-lineGutter) {
            background-color: var(--bgcolor-error-weak) !important;
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
        :global(.cm-string),
        :global(.cm-number),
        :global(.cm-propertyName) {
            font-weight: 400;
            font-style: normal;
            line-height: 140%; /* 16.8px */
            font-size: var(--font-size-xs, 12px);
            color: var(--fgcolor-neutral-primary);
            font-family: var(--font-family-code, 'Fira Code');
        }

        // System fields muted styling (when suggestions are showing)
        // Must come after .cm-propertyName to override
        :global(.cm-system-field-muted),
        :global(.cm-system-field-muted *),
        :global(.cm-system-field-muted.cm-propertyName),
        :global(.cm-system-field-muted .cm-propertyName) {
            color: var(--fgcolor-neutral-tertiary, #97979b) !important;
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
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='4' viewBox='0 0 10 4' fill='none'%3E%3Cpath d='M0 2 C1.5 0.6 3.5 0.6 5 2 C6.5 3.4 8.5 3.4 10 2' stroke='%23f04438' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            background-repeat: repeat-x;
            background-position: left bottom;
            background-size: 10px 4px;
            padding-bottom: 3px;
        }

        :global(.cm-lintRange-warning) {
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='4' viewBox='0 0 10 4' fill='none'%3E%3Cpath d='M0 2 C1.5 0.6 3.5 0.6 5 2 C6.5 3.4 8.5 3.4 10 2' stroke='%23ffa500' stroke-width='1' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
            background-repeat: repeat-x;
            background-position: left bottom;
            background-size: 10px 4px;
            padding-bottom: 3px;
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
