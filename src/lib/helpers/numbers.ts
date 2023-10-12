export function abbreviateNumber(num: number, decimals: number = 1): string {
    if (isNaN(num)) return String(num);
    if (num >= 1000000) {
        const result = num / 1000000;
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
