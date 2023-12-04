import { writable } from 'svelte/store';

export type SupportData = {
    message: string;
    category: string;
    file?: File | null;
    project?: string
};

export const supportData = writable<SupportData>({
    message: '',
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

    if (hour < 9 || hour > 17) {
        return false;
    }

    return true;
}

export const showSupportModal = writable(false);
