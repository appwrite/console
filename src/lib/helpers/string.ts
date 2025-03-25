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

export function formatNum(number: number): string {
    return formatter.format(number);
}

/**
 * Returns a regex to check hostname validity. Supports wildcards too!
 */
export const hostnameRegex = String.raw`(\*)|(\*\.)?(?!-)[A-Za-z0-9\-]+([\-\.]{1}[a-z0-9]+)*\.[A-Za-z]{2,18}|localhost`;
