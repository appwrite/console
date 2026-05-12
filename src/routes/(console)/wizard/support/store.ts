import { writable } from 'svelte/store';

export type SupportData = {
    message: string | null;
    subject: string | null;
    file?: File | null;
    project?: string | null;
};

export const supportData = writable<SupportData>({
    message: null,
    subject: null,
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

    // Support hours are 04:00 UTC to 17:00 UTC on weekdays
    if (hour >= 4 && hour < 17) {
        return true;
    }

    return false;
}

export const showSupportModal = writable(false);
