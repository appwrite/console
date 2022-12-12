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
