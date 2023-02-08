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
