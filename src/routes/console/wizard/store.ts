import { writable } from 'svelte/store';

export type SupportData = {
    message: string;
    category: string;
    file?: File | null;
};

export const supportData = writable<SupportData>({
    message: '',
    category: 'general',
    file: null
});

export function isSupportOnline() {
    const currentDate = new Date();
    const day = currentDate.getDay();
    const hour = currentDate.getHours();

    if (day === 1 || day === 6) {
        return false;
    }

    if (hour < 9 || hour > 17) {
        return false;
    }

    return true;
}
