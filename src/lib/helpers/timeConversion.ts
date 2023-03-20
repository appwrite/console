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
