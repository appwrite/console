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
    const value = Math.max(min, number);
    const formatter = new Intl.NumberFormat('en');
    return formatter.format(value);
}

export function formatCurrency(
    number: number,
    locale = 'en-US',
    currency = 'USD',
    min: number = 0
): string {
    if (isNaN(number)) return String(number);
    const value = Math.max(min, number);
    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
    });
    return formatter.format(value);
}

export function isWithinSafeRange(val: number) {
    return Math.abs(val) < Number.MAX_SAFE_INTEGER;
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
