// system configuration constants
export const ALLOWED_DOLLAR_PROPS = ['$id', '$createdAt', '$updatedAt'] as const;
export const SYSTEM_KEYS = new Set(['$id:', '$createdAt:', '$updatedAt:']);

// timing constants
export const DEBOUNCE_DELAY = 200;
export const LINTER_DELAY = 250;

// regex patterns (compiled once for performance)
export const UNQUOTED_KEY_REGEX = /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g;
export const INDENT_REGEX = /^[\t ]*/;
export const SCALAR_VALUE_REGEX =
    /:\s*(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')\s*$/;
export const TRAILING_COMMA_REGEX = /,\s*$/;
export const WHITESPACE_REGEX = /^\s*/;
export const WHITESPACE_ONLY_REGEX = /^\s+$/;
export const NESTED_KEY_REGEX = /^(\s{4,})([A-Za-z_$][A-Za-z0-9_$]*)\s*:/;

// pre-computed indent strings for performance (0-20 levels of nesting)
export const INDENT_CACHE = Array.from({ length: 21 }, (_, i) => '  '.repeat(i));

// helper to get cached indent string
export function getIndent(level: number): string {
    return level < INDENT_CACHE.length ? INDENT_CACHE[level] : '  '.repeat(level);
}

// skeleton line configuration for loading state
const buildLines = (indent: number, ...widths: number[]) =>
    widths.map((w) => ({ indent, width: w }));

export const SKELETON_LINES = [
    ...buildLines(0, 8), // opening bracket
    ...buildLines(16, 172, 150, 193, 100, 287, 186, 64), // outer items
    ...buildLines(32, 141, 91, 105, 112), // nested items
    ...buildLines(16, 8, 236, 236), // more outer items
    ...buildLines(0, 8) // closing bracket
];
