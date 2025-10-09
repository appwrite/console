import { clampMin } from './numbers';

/**
 * Capitalizes the first letter of a string
 *
 * @export
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Given a string, returns the singular version of it,
 * by removing the trailing 's'.
 *
 * @export
 * @param {string} str
 * @returns {string}
 */
export function singular(str: string): string {
    return str.replace(/s$/, '');
}

/**
 * Convert a dash/underscore/space separated string to camelCase.
 *
 * @export
 * @param {string} str - The string to convert.
 * @returns {string} The camelized string.
 */
export function camelize(str: string): string {
    if (!str) {
        return '';
    }
    return str
        .replace(/[-_\s]+(.)?/g, (_, char: string) => {
            return char ? char.toUpperCase() : '';
        })
        .replace(/^(.)/, (firstChar) => {
            return firstChar.toLowerCase();
        });
}

const formatter = Intl.NumberFormat('en', {
    notation: 'compact'
});

export function formatNum(number: number, min: number = 0): string {
    return formatter.format(clampMin(number, min));
}

/**
 * Format a string with optional mobile-aware truncation.
 */
export function formatName(
    name: string,
    limit: number = 19,
    isSmallViewport: boolean = false
): string {
    const mobileLimit = 16;
    const actualLimit = isSmallViewport ? mobileLimit : limit;
    return name ? (name.length > actualLimit ? `${name.slice(0, actualLimit)}...` : name) : '-';
}

/**
 * Returns a regex to check hostname validity. Supports wildcards too!
 */
export const hostnameRegex = String.raw`(\*)|(\*\.)?(?!-)[A-Za-z0-9\-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,18}|localhost`;

/**
 * Returns a regex to check hostname validity.
 *
 * Supports domains, localhost, wildcards, ip-addresses and Chrome extension IDs!
 */
export const extendedHostnameRegex = String.raw`(\*)|(\*\.)?((?!-)[A-Za-z0-9\-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,18}|localhost|(\d{1,3}\.){3}\d{1,3}|[a-z0-9]{32})`;

export function hash(input: string | string[], delimiter: string = ','): string {
    const str = Array.isArray(input) ? input.join(delimiter) : input;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash + str.charCodeAt(i)) & 0xffffffff;
    }
    return Math.abs(hash).toString(36);
}
