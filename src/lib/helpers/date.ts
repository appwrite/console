import { browser } from '$app/environment';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

if (browser) {
    dayjs.extend(relativeTime);
}

export const toLocaleDate = (datetime: string) => {
    const date = new Date(datetime);

    if (isNaN(date.getTime())) {
        return 'n/a';
    }

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };

    return date.toLocaleDateString('en', options);
};

export const toLocaleDateTime = (datetime: string | number) => {
    const date = new Date(datetime);

    if (isNaN(date.getTime())) {
        return 'n/a';
    }

    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h23'
    };

    return date.toLocaleDateString('en', options);
};

/**
 * Returns a date string usig the local timezone in ISO format (yyyy-mm-dd)
 *
 * @param datetime date string or milliseconds since the epoch
 */
export const toLocaleDateISO = (datetime: string | number) => {
    const date = new Date(datetime);

    if (isNaN(date.getTime())) {
        return 'n/a';
    }

    // Use Sweden's locale (sv) since it matches ISO format
    return date.toLocaleDateString('sv');
};

/**
 * Returns a time string usig the local timezone in ISO format (hh:mm:ss)
 *
 * @param datetime date string or milliseconds since the epoch
 */
export const toLocaleTimeISO = (datetime: string | number) => {
    const date = new Date(datetime);

    if (isNaN(date.getTime())) {
        return 'n/a';
    }

    // Use Sweden's locale (sv) since it matches ISO format
    return date.toLocaleTimeString('sv');
};

export const isSameDay = (date1: Date, date2: Date) => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

export const isValidDate = (date: string) => {
    return !isNaN(new Date(date).getTime());
};

export const diffDays = (date1: Date, date2: Date) => {
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export function timeFromNow(datetime: string): string {
    return dayjs().to(dayjs(datetime));
}

export function hoursToDays(hours: number) {
    if (hours > 24) {
        return `${Math.floor(hours / 24)} days`;
    } else {
        return `${hours} hour`;
    }
}

export function getTomorrow(date: Date) {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 2);
    tomorrow.setHours(0, 0, 0, 0);

    return tomorrow;
}
