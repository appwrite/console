import type { EditorState } from '@codemirror/state';
import type { Diagnostic } from '@codemirror/lint';

type SmartError = {
    message: string;
    hint?: string;
    range?: { from: number; to: number };
};

const MAX_VALUE_TOKEN_LENGTH = 18;
const ALLOWED_LITERALS = new Set(['true', 'false', 'null']);

type ErrorContext = {
    raw: string;
    pos: number;
    line: { from: number; to: number; number: number; text: string };
    lineText: string;
    col: number;
    charAtError: string;
    colonIndex: number;
    prevLine: { number: number; text: string } | null;
    nextLine: { number: number; text: string } | null;
    currentKey: string | null;
    keyPart: string | null;
    insideArray: boolean;
    braceDepth: number;
    bracketDepth: number;
    braceDepthAtPos: number;
    bracketDepthAtPos: number;
    openQuoteBeforeLine: { quote: '"' | "'"; pos: number } | null;
};

function stripJson5Prefix(message: string): string {
    return message.replace(/^JSON5:\s*/i, '').trim();
}

function getKeyName(lineText: string, colonIndex: number): string | null {
    const keyPart = lineText.slice(0, colonIndex).trim();
    const match = keyPart.match(/^(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([A-Za-z_$][\w$]*))$/);
    return match ? match[1] || match[2] || match[3] || null : null;
}

function getValueToken(lineText: string, colonIndex: number): string | null {
    const rest = lineText.slice(colonIndex + 1);
    const leading = rest.match(/^\s*/)?.[0].length ?? 0;
    const trimmed = rest.slice(leading);
    const valueMatch = trimmed.match(/^([^\s,}]+)/);
    return valueMatch ? valueMatch[1] : null;
}

function getValueRange(
    lineText: string,
    lineFrom: number,
    colonIndex: number
): { from: number; to: number } | null {
    if (colonIndex === -1) return null;
    let startOffset = colonIndex + 1;
    while (startOffset < lineText.length && /\s/.test(lineText[startOffset])) {
        startOffset += 1;
    }
    let endOffset = lineText.length;
    while (endOffset > startOffset && /\s/.test(lineText[endOffset - 1])) {
        endOffset -= 1;
    }
    if (endOffset <= startOffset) return null;
    return { from: lineFrom + startOffset, to: lineFrom + endOffset };
}

function getMissingCommaMessage(prevKey: string | null, prevValueToken: string | null): string {
    if (
        prevValueToken &&
        prevValueToken.length <= MAX_VALUE_TOKEN_LENGTH &&
        !prevValueToken.startsWith('{') &&
        !prevValueToken.startsWith('[')
    ) {
        return `Expected ',' after ${prevValueToken}`;
    }
    if (prevKey) {
        return `Expected ',' after value for "${prevKey}"`;
    }
    return "Expected ',' after previous value";
}

function isNumberToken(token: string): boolean {
    return /^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(token);
}

function isBareWord(token: string): boolean {
    return /^[A-Za-z_$][\w$]*$/.test(token);
}

function looksLikePropertyLine(text: string): boolean {
    return /^\s*(?:"[^"]+"|'[^']+'|[A-Za-z_$][\w$]*)\s*:/.test(text);
}

function nextNonEmptyLine(
    state: EditorState,
    lineNumber: number
): { number: number; text: string } | null {
    for (let i = lineNumber + 1; i <= state.doc.lines; i += 1) {
        const text = state.doc.line(i).text;
        if (text.trim().length) {
            return { number: i, text };
        }
    }
    return null;
}

function prevNonEmptyLine(
    state: EditorState,
    lineNumber: number
): { number: number; text: string } | null {
    for (let i = lineNumber - 1; i >= 1; i -= 1) {
        const text = state.doc.line(i).text;
        if (text.trim().length) {
            return { number: i, text };
        }
    }
    return null;
}

function getIndentLength(text: string): number {
    return text.match(/^\s*/)?.[0].length ?? 0;
}

function prevNonSpaceChar(text: string, fromIndex: number): string | null {
    for (let i = fromIndex; i >= 0; i -= 1) {
        const ch = text[i];
        if (!/\s/.test(ch)) return ch;
    }
    return null;
}

function nextNonSpaceChar(text: string, fromIndex: number): string | null {
    for (let i = fromIndex; i < text.length; i += 1) {
        const ch = text[i];
        if (!/\s/.test(ch)) return ch;
    }
    return null;
}

function isValueStartChar(ch: string): boolean {
    return /["'{[\d\-+.A-Za-z_$]/.test(ch);
}

function extractNumberToken(
    lineText: string,
    col: number
): { token: string; start: number; end: number } | null {
    const allowed = /[0-9.+-]/;
    let start = col;
    while (start > 0 && allowed.test(lineText[start - 1])) {
        start -= 1;
    }
    let end = col;
    while (end < lineText.length && allowed.test(lineText[end])) {
        end += 1;
    }
    if (start === end) return null;
    const token = lineText.slice(start, end);
    if (!/[0-9]/.test(token)) return null;
    return { token, start, end };
}

function hasUnclosedQuote(lineText: string, quote: '"' | "'"): boolean {
    let count = 0;
    let escaped = false;
    for (const ch of lineText) {
        if (escaped) {
            escaped = false;
            continue;
        }
        if (ch === '\\') {
            escaped = true;
            continue;
        }
        if (ch === quote) count += 1;
    }
    return count % 2 === 1;
}

function scanDocument(
    state: EditorState,
    pos: number,
    lineStart: number
): {
    braceDepth: number;
    bracketDepth: number;
    braceDepthAtPos: number;
    bracketDepthAtPos: number;
    openQuoteBeforeLine: { quote: '"' | "'"; pos: number } | null;
} {
    const text = state.doc.toString();
    let inQuote: '"' | "'" | null = null;
    let openPos = -1;
    let escaped = false;
    let braceDepth = 0;
    let bracketDepth = 0;
    let braceDepthAtPos = 0;
    let bracketDepthAtPos = 0;
    let openQuoteBeforeLine: { quote: '"' | "'"; pos: number } | null = null;

    for (let i = 0; i < text.length; i += 1) {
        const ch = text[i];

        if (inQuote) {
            if (escaped) {
                escaped = false;
                continue;
            }
            if (ch === '\\') {
                escaped = true;
                continue;
            }
            if (ch === inQuote) {
                inQuote = null;
                openPos = -1;
            }
        } else {
            if (ch === '"' || ch === "'") {
                inQuote = ch;
                openPos = i;
            } else if (ch === '{') {
                braceDepth += 1;
            } else if (ch === '}') {
                braceDepth -= 1;
            } else if (ch === '[') {
                bracketDepth += 1;
            } else if (ch === ']') {
                bracketDepth -= 1;
            }
        }

        if (i === lineStart - 1) {
            openQuoteBeforeLine = inQuote && openPos >= 0 ? { quote: inQuote, pos: openPos } : null;
        }

        if (i === pos) {
            braceDepthAtPos = braceDepth;
            bracketDepthAtPos = bracketDepth;
        }
    }

    if (pos >= text.length) {
        braceDepthAtPos = braceDepth;
        bracketDepthAtPos = bracketDepth;
    }

    if (lineStart <= 0) {
        openQuoteBeforeLine = null;
    }

    return {
        braceDepth,
        bracketDepth,
        braceDepthAtPos,
        bracketDepthAtPos,
        openQuoteBeforeLine
    };
}

function buildContext(state: EditorState, diagnostic: Diagnostic): ErrorContext {
    const raw = stripJson5Prefix(diagnostic.message || 'Syntax error');
    const pos = diagnostic.from;
    const line = state.doc.lineAt(pos);
    const lineText = line.text;
    const col = pos - line.from;
    const charAtError = state.doc.sliceString(pos, pos + 1);

    const colonIndex = lineText.indexOf(':');
    const prevLine = prevNonEmptyLine(state, line.number);
    const currentKey = colonIndex !== -1 ? getKeyName(lineText, colonIndex) : null;
    const keyPart = colonIndex !== -1 ? lineText.slice(0, colonIndex).trim() : null;
    const nextLine = nextNonEmptyLine(state, line.number);
    const scan = scanDocument(state, pos, line.from);
    const insideArray = scan.bracketDepthAtPos > 0;

    return {
        raw,
        pos,
        line,
        lineText,
        col,
        charAtError,
        colonIndex,
        prevLine,
        nextLine,
        currentKey,
        keyPart,
        insideArray,
        braceDepth: scan.braceDepth,
        bracketDepth: scan.bracketDepth,
        braceDepthAtPos: scan.braceDepthAtPos,
        bracketDepthAtPos: scan.bracketDepthAtPos,
        openQuoteBeforeLine: scan.openQuoteBeforeLine
    };
}

function detectMissingCommaPrevLine(state: EditorState, context: ErrorContext): SmartError | null {
    const { lineText, prevLine } = context;
    if (prevLine && looksLikePropertyLine(lineText)) {
        const prevIndent = getIndentLength(prevLine.text);
        const currentIndent = getIndentLength(lineText);
        const prevTrimmed = prevLine.text.trim();
        const prevEndsWithComma = prevTrimmed.endsWith(',');
        const prevEndsWithOpen = prevTrimmed.endsWith('{') || prevTrimmed.endsWith('[');
        const prevEndsWithColon = prevTrimmed.endsWith(':');

        if (
            prevIndent === currentIndent &&
            !prevEndsWithComma &&
            !prevEndsWithOpen &&
            !prevEndsWithColon
        ) {
            const prevColonIndex = prevLine.text.indexOf(':');
            const prevKey =
                prevColonIndex !== -1 ? getKeyName(prevLine.text, prevColonIndex) : null;
            const prevRange =
                prevColonIndex !== -1
                    ? getValueRange(
                          prevLine.text,
                          state.doc.line(prevLine.number).from,
                          prevColonIndex
                      )
                    : null;
            const prevValueToken =
                prevColonIndex !== -1 ? getValueToken(prevLine.text, prevColonIndex) : null;
            return {
                message: getMissingCommaMessage(prevKey, prevValueToken),
                range: prevRange ?? undefined
            };
        }
    }

    return null;
}

function detectCommentToken(context: ErrorContext): SmartError | null {
    if (context.charAtError === '/') {
        return {
            message: 'Comments are not supported',
            hint: 'Remove // or /* */.'
        };
    }
    return null;
}

function detectUnclosedStringAcrossLines(
    state: EditorState,
    context: ErrorContext
): SmartError | null {
    const { line, openQuoteBeforeLine } = context;
    const open = openQuoteBeforeLine;
    if (!open) return null;
    const openLine = state.doc.lineAt(open.pos);
    if (openLine.number === line.number) return null;
    return {
        message: 'Unclosed string',
        hint: 'Add the closing quote.',
        range: { from: open.pos, to: openLine.to }
    };
}

function detectInvalidPropertyName(context: ErrorContext): SmartError | null {
    const { colonIndex, keyPart, line } = context;
    if (colonIndex !== -1 && keyPart) {
        const validKey = /^(?:"[^"]+"|'[^']+'|[A-Za-z_$][\w$]*)$/.test(keyPart);
        if (!validKey) {
            return {
                message: 'Invalid property name',
                hint: 'Use quotes for keys with spaces or symbols.',
                range: { from: line.from, to: line.from + colonIndex }
            };
        }
    }

    return null;
}

function detectMissingColon(context: ErrorContext): SmartError | null {
    const { colonIndex, lineText, prevLine, line, nextLine } = context;
    if (colonIndex === -1) {
        const trimmed = lineText.trim();
        const keyMatch = trimmed.match(/^(?:"[^"]+"|'[^']+'|[A-Za-z_$][\w$]*)/);
        const hasValue = keyMatch ? trimmed.length > keyMatch[0].length : false;
        const prevLooksObject =
            !!prevLine &&
            (prevLine.text.trim().endsWith('{') || looksLikePropertyLine(prevLine.text));
        const nextLooksProperty = !!nextLine && looksLikePropertyLine(nextLine.text);

        if (keyMatch && hasValue && (prevLooksObject || nextLooksProperty)) {
            return {
                message: 'Missing ":" after property name',
                hint: 'Insert ":" between the key and value.',
                range: { from: line.from, to: line.from + keyMatch[0].length }
            };
        }
    }

    return null;
}

function detectMissingValueAfterColon(context: ErrorContext): SmartError | null {
    const { colonIndex, lineText, line } = context;
    if (colonIndex !== -1) {
        const afterColon = lineText.slice(colonIndex + 1).trim();
        if (
            !afterColon ||
            afterColon.startsWith(',') ||
            afterColon.startsWith('}') ||
            afterColon.startsWith(']')
        ) {
            return {
                message: 'Missing value after ":"',
                hint: 'Provide a value (string, number, object, or array).',
                range: { from: line.from + colonIndex, to: line.from + colonIndex + 1 }
            };
        }
    }

    return null;
}

function detectInvalidValue(context: ErrorContext): SmartError | null {
    const { colonIndex, col, lineText } = context;
    if (colonIndex !== -1 && col > colonIndex) {
        const keyName = getKeyName(lineText, colonIndex);
        const valueToken = getValueToken(lineText, colonIndex);
        if (valueToken) {
            const isAllowed =
                valueToken.startsWith('"') ||
                valueToken.startsWith("'") ||
                valueToken.startsWith('{') ||
                valueToken.startsWith('[') ||
                isNumberToken(valueToken) ||
                ALLOWED_LITERALS.has(valueToken);
            if (!isAllowed && isBareWord(valueToken)) {
                return {
                    message: keyName ? `Invalid value for ${keyName}` : 'Invalid value',
                    hint: 'Strings must be quoted.'
                };
            }
        }
    }

    return null;
}

function detectArrayCommaIssues(context: ErrorContext): SmartError | null {
    const { charAtError, lineText, col, pos, insideArray } = context;
    if (charAtError === ',') {
        const prevChar = prevNonSpaceChar(lineText, col - 1);
        const nextChar = nextNonSpaceChar(lineText, col + 1);
        if (insideArray && (prevChar === '[' || prevChar === ',')) {
            return {
                message: 'Empty array item',
                hint: 'Add a value before the comma.',
                range: { from: pos, to: pos + 1 }
            };
        }
        if (insideArray && nextChar === ',') {
            return {
                message: 'Empty array item',
                hint: 'Remove the extra comma or add a value.',
                range: { from: pos, to: pos + 1 }
            };
        }
    }

    return null;
}

function detectMissingArrayComma(context: ErrorContext): SmartError | null {
    const { charAtError, lineText, col, pos, insideArray } = context;
    if (!charAtError || !isValueStartChar(charAtError)) return null;
    if (!insideArray) return null;
    const prevChar = prevNonSpaceChar(lineText, col - 1);
    if (prevChar && prevChar !== '[' && prevChar !== ',' && prevChar !== ':') {
        return {
            message: "Missing ',' between array values",
            hint: 'Add a comma between items.',
            range: { from: pos, to: pos + 1 }
        };
    }
    return null;
}

function detectInvalidEscape(context: ErrorContext): SmartError | null {
    const raw = context.raw.toLowerCase();
    if (raw.includes('escape')) {
        return {
            message: 'Invalid escape sequence',
            hint: 'Use valid escapes like \\n, \\t, \\\\, or \\".'
        };
    }
    return null;
}

function detectInvalidNumber(context: ErrorContext): SmartError | null {
    const raw = context.raw.toLowerCase();
    if (!raw.includes('number')) return null;

    const tokenInfo = extractNumberToken(context.lineText, context.col);
    if (!tokenInfo) {
        return {
            message: 'Invalid number literal',
            hint: 'Only plain decimals are supported (no exponent or hex).'
        };
    }

    const { token, start, end } = tokenInfo;
    const range = { from: context.line.from + start, to: context.line.from + end };
    if (token === '+' || token === '-' || token === '.') {
        return {
            message: 'Invalid number literal',
            hint: 'Add digits after the sign or decimal point.',
            range
        };
    }

    if (token.includes('..')) {
        return {
            message: 'Invalid number literal',
            hint: 'A number can only have one decimal point.',
            range
        };
    }

    if (!/^[+-]?(?:\d+\.?\d*|\.\d+)$/.test(token)) {
        return {
            message: 'Invalid number literal',
            hint: 'Only plain decimals are supported (no exponent or hex).',
            range
        };
    }

    return null;
}

function detectUnexpectedCloser(_state: EditorState, context: ErrorContext): SmartError | null {
    const { charAtError, pos, braceDepthAtPos, bracketDepthAtPos } = context;
    if (charAtError === '}' || charAtError === ']') {
        const depthAtPos = charAtError === '}' ? braceDepthAtPos : bracketDepthAtPos;
        if (depthAtPos < 0) {
            return {
                message: `Unexpected '${charAtError}'`,
                hint: 'Remove the extra closing bracket.',
                range: { from: pos, to: pos + 1 }
            };
        }
    }

    return null;
}

function detectMissingCommaNextLine(context: ErrorContext): SmartError | null {
    const { colonIndex, nextLine, lineText, line, currentKey } = context;
    const lineTrimmed = lineText.trim();
    const hasColon = colonIndex !== -1;
    const nextIsProperty = !!nextLine && looksLikePropertyLine(nextLine.text);
    const hasComma = lineTrimmed.endsWith(',');
    const endsWithColon = lineTrimmed.endsWith(':');
    const endsWithOpen = lineTrimmed.endsWith('{') || lineTrimmed.endsWith('[');

    if (hasColon && nextIsProperty && !hasComma && !endsWithColon && !endsWithOpen) {
        const currentRange = getValueRange(lineText, line.from, colonIndex);
        const currentValueToken = getValueToken(lineText, colonIndex);
        return {
            message: getMissingCommaMessage(currentKey, currentValueToken),
            range: currentRange ?? undefined
        };
    }

    return null;
}

function detectUnclosedString(context: ErrorContext): SmartError | null {
    const { lineText } = context;
    if (hasUnclosedQuote(lineText, '"') || hasUnclosedQuote(lineText, "'")) {
        return { message: 'Unclosed string', hint: 'Add the closing quote.' };
    }

    return null;
}

function detectUnexpectedEnd(_state: EditorState, context: ErrorContext): SmartError | null {
    const { raw, braceDepth, bracketDepth } = context;
    if (raw.toLowerCase().includes('end of input')) {
        if (braceDepth > 0) {
            return { message: 'Unexpected end of input', hint: 'Missing }.' };
        }
        if (bracketDepth > 0) {
            return { message: 'Unexpected end of input', hint: 'Missing ].' };
        }
    }

    return null;
}

function detectInvalidCharacter(context: ErrorContext): SmartError | null {
    const { raw, charAtError } = context;
    if (raw.toLowerCase().includes('invalid character') && charAtError) {
        return {
            message: `Unexpected token '${charAtError}'`
        };
    }

    return null;
}

export function makeErrorMessage(state: EditorState, diagnostic: Diagnostic): SmartError {
    const context = buildContext(state, diagnostic);
    const detectors: Array<(state: EditorState, context: ErrorContext) => SmartError | null> = [
        (_state, ctx) => detectCommentToken(ctx),
        detectUnclosedStringAcrossLines,
        detectMissingCommaPrevLine,
        (_state, ctx) => detectInvalidPropertyName(ctx),
        (_state, ctx) => detectMissingColon(ctx),
        (_state, ctx) => detectMissingValueAfterColon(ctx),
        (_state, ctx) => detectInvalidValue(ctx),
        (_state, ctx) => detectArrayCommaIssues(ctx),
        (_state, ctx) => detectMissingArrayComma(ctx),
        (_state, ctx) => detectInvalidEscape(ctx),
        (_state, ctx) => detectInvalidNumber(ctx),
        detectUnexpectedCloser,
        (_state, ctx) => detectMissingCommaNextLine(ctx),
        (_state, ctx) => detectUnclosedString(ctx),
        detectUnexpectedEnd,
        (_state, ctx) => detectInvalidCharacter(ctx)
    ];

    for (const detector of detectors) {
        const result = detector(state, context);
        if (result) return result;
    }

    return { message: context.raw || 'Syntax error' };
}
