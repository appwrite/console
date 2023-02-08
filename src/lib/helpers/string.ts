/**
<<<<<<< HEAD
 * Capitalizes the first letter of a string
=======
 * Given a string, returns the singular version of it,
 * by removing the trailing 's'.
>>>>>>> main
 *
 * @export
 * @param {string} str
 * @returns {string}
 */
<<<<<<< HEAD
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
=======
export function singular(str: string): string {
    return str.replace(/s$/, '');
>>>>>>> main
}
