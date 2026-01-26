export const LARGE_NUMBER_THRESHOLD = 1_000_000n;

export function abbreviateNumber(num: number, decimals: number = 1): string {
    if (isNaN(num)) return String(num);
    if (num >= 1_000_000_000) {
        const result = num / 1_000_000_000;
        return result.toFixed(result % 1 !== 0 ? decimals : 0) + 'B';
    } else if (num >= 1_000_000) {
        const result = num / 1_000_000;
        return result.toFixed(result % 1 !== 0 ? decimals : 0) + 'M';
    } else if (num >= 1000) {
        const result = num / 1000;
        return result.toFixed(result % 1 !== 0 ? decimals : 0) + 'K';
    } else {
        return num.toString();
    }
}

export function toDecimals(num: number, decimals: number = 1): number {
    return parseFloat(num.toFixed(decimals));
}

export function formatNumberWithCommas(number: number, min: number = 0): string {
    if (isNaN(number)) return String(number);
    const formatter = new Intl.NumberFormat('en');
    return formatter.format(clampMin(number, min));
}

export function formatCurrency(
    number: number,
    locale = 'en-US',
    currency = 'USD',
    min: number = 0
): string {
    if (isNaN(number)) return String(number);
    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
    });
    return formatter.format(clampMin(number, min));
}

export function isWithinSafeRange(val: number) {
    return Math.abs(val) < Number.MAX_SAFE_INTEGER;
}

export function coerceToNumber(val: number | bigint) {
    return Number(val);
}

/**
 * Converts a bigint to exponential notation without precision loss.
 */
export function toExponential(value: number | bigint, fractionDigits: number = 2): string {
    fractionDigits = Math.trunc(fractionDigits);
    if (fractionDigits < 0 || fractionDigits > 100) {
        throw new RangeError('toExponential() argument must be between 0 and 100');
    }

    if (typeof value === 'number') {
        return value.toExponential(fractionDigits);
    }

    if (value === 0n) {
        return fractionDigits === 0 ? '0e+0' : `0.${'0'.repeat(fractionDigits)}e+0`;
    }

    const bigIntString = value.toString();

    // split to get sign and value as string!
    const [sign, digits] = !bigIntString.startsWith('-')
        ? ['', bigIntString]
        : ['-', bigIntString.slice(1)];

    const fraction = digits.slice(1, 1 + fractionDigits).padEnd(fractionDigits, '0');

    // example: 900719925474103n => "9.00e+14"
    return `${sign}${digits[0]}.${fraction}e+${digits.length - 1}`;
}

/**
 * Clamps a number to a minimum value
 *
 * @export
 * @param {number} value
 * @param {number} min
 * @returns {number}
 */
export function clampMin(value: number, min: number = 0): number {
    return Math.max(min, value || 0);
}
