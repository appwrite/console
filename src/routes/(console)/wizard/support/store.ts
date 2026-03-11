import { writable } from 'svelte/store';

export type SupportData = {
    message: string;
    subject: string;
    category: string;
    topic?: string;
    severity?: string;
    file?: File | null;
    project?: string;
};

export const supportData = writable<SupportData>({
    message: '',
    subject: '',
    category: 'technical',
    severity: 'question',
    file: null
});

export function isSupportOnline() {
    const currentDate = new Date();
    const day = currentDate.getUTCDay();
    const hour = currentDate.getUTCHours();
    const minute = currentDate.getUTCMinutes();

    // Support is offline on weekends (Sunday = 0, Saturday = 6)
    if (day === 0 || day === 6) {
        return false;
    }

    // Support hours start at 03:30 UTC on weekdays; support is offline from 00:00–03:29 UTC
    if (hour > 3 || (hour === 3 && minute >= 30)) {
        return true;
    }

    return false;
}

export const showSupportModal = writable(false);
