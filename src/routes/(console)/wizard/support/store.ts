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
    category: 'general',
    file: null
});

export function isSupportOnline() {
    const currentDate = new Date();
    const day = currentDate.getUTCDay();
    const hour = currentDate.getUTCHours();

    // Support is offline on weekends (Sunday = 0, Saturday = 6)
    if (day === 0 || day === 6) {
        return false;
    }

    // Support hours are 16:00 UTC to 23:59 UTC on weekdays
    // This roughly covers 09:00 PT to 17:00 PT (depending on PST/PDT)
    if (hour >= 16) {
        return true;
    }

    return false;
}

export const showSupportModal = writable(false);
