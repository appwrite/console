import { writable } from 'svelte/store';

export type SupportData = {
    message: string;
    subject: string;
    category: string;
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

    if (day === 1 || day === 6) {
        return false;
    }

    if (hour < 14) {
        return false;
    }

    return true;
}

export const showSupportModal = writable(false);
