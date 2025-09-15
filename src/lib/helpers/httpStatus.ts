/**
 * determines the badge color based on HTTP status code
 *
 * @param statusCode
 * @returns badge coklor
 */
export function getBadgeTypeFromStatusCode(
    statusCode: number
): 'error' | 'warning' | 'success' | undefined {
    if (statusCode >= 500) {
        return 'error';
    }

    if (statusCode >= 400) {
        return 'warning';
    }

    if (statusCode === 0) {
        return undefined;
    }

    return 'success';
}
