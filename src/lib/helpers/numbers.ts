export function abbreviateNumber(num: number, decimals: number = 1): string {
    if (isNaN(num)) return String(num);
    const factor = 10 ** decimals;
    if (num >= 1_000_000_000) {
        const result = num / 1_000_000_000;
        return (Math.floor(result * factor) / factor).toFixed(decimals) + 'B';
    } else if (num >= 1_000_000) {
        const result = num / 1_000_000;
        return (Math.floor(result * factor) / factor).toFixed(decimals) + 'M';
    } else if (num >= 1000) {
        const result = num / 1000;
        return (Math.floor(result * factor) / factor).toFixed(decimals) + 'K';
    } else {
        return num.toString();
    }
}

export function toDecimals(num: number, decimals: number = 1): number {
    return parseFloat(num.toFixed(decimals));
}

export function formatNumberWithCommas(number: number): string {
    if (isNaN(number)) return String(number);
    const formatter = new Intl.NumberFormat('en');
    return formatter.format(number);
}

export function formatCurrency(number: number, locale = 'en-US', currency = 'USD'): string {
    if (isNaN(number)) return String(number);
    const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency
    });
    return formatter.format(number);
}
