/**
 * Formats the time in a human readable format.
 *
 * @export
 * @param {number} time - The time in seconds.
 * @returns {string} The formatted time string.
 */
export function calculateTime(time: number) {
    const milliseconds = Math.floor(time * 1000);
    const seconds = Math.floor(time);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (milliseconds < 1000) {
        return `${milliseconds}ms`;
    } else if (seconds < 60) {
        return `${seconds}s`;
    } else if (minutes < 60) {
        return `${minutes}m`;
    } else if (hours < 24) {
        return `${hours}h`;
    } else if (days < 30) {
        return `${days}d`;
    } else if (months < 12) {
        return `${months}M`;
    } else {
        return `${years}y`;
    }
}

type Unit = 'ms' | 's' | 'm' | 'h' | 'd' | 'M' | 'y';

export function timeToSeconds(time: number, unit: Unit) {
    switch (unit) {
        case 'ms':
            return time / 1000;
        case 's':
            return time;
        case 'm':
            return time * 60;
        case 'h':
            return time * 60 * 60;
        case 'd':
            return time * 60 * 60 * 24;
        case 'M':
            return time * 60 * 60 * 24 * 30;
        case 'y':
            return time * 60 * 60 * 24 * 30 * 12;
        default:
            return time;
    }
}
export function timeToMinutes(time: number, unit: Unit) {
    switch (unit) {
        case 'ms':
            return time / 1000 / 60;
        case 's':
            return time / 60;
        case 'm':
            return time;
        case 'h':
            return time * 60;
        case 'd':
            return time * 60 * 24;
        case 'M':
            return time * 60 * 24 * 30;
        case 'y':
            return time * 60 * 24 * 30 * 12;
        default:
            return time;
    }
}

export function secsToUnit(time: number, unit: Unit) {
    switch (unit) {
        case 'ms':
            return time * 1000;
        case 's':
            return time;
        case 'm':
            return time / 60;
        case 'h':
            return time / 60 / 60;
        case 'd':
            return time / 60 / 60 / 24;
        case 'M':
            return time / 60 / 60 / 24 / 30;
        case 'y':
            return time / 60 / 60 / 24 / 30 / 12;
        default:
            return time;
    }
}

/**
 * Formats time in seconds to a detailed string showing days, hours, minutes, and seconds
 * @param time Time in seconds
 * @returns Formatted string like "3d 4h 30m 23s"
 */
export function formatTimeDetailed(time: number): string {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor((time / 60) % 60);
    const hours = Math.floor((time / (60 * 60)) % 24);
    const days = Math.floor(time / (60 * 60 * 24));

    const parts: string[] = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
}

/**
 * Calculates the time difference between a starting date/time and the current time.
 * Returns the difference formatted in seconds, minutes, or hours depending on the magnitude.
 *
 * @export
 * @param {Date | number | string} startTime - The starting date/time, timestamp in milliseconds, or ISO date string (e.g., '2025-03-20T15:50:43.495+00:00')
 * @returns {string} The formatted time difference
 */
export function timer(startTime: Date | number | string): string {
    let start: number;

    if (startTime instanceof Date) {
        start = startTime.getTime();
    } else if (typeof startTime === 'number') {
        start = startTime;
    } else {
        // Handle ISO date string format
        start = new Date(startTime).getTime();
    }

    const now = new Date().getTime();
    const diffInSeconds = (now - start) / 1000;

    return calculateTime(diffInSeconds);
}
