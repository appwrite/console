import { writable } from 'svelte/store';

type PlatformFormData = {
    name: string | null;
    key: string | null;
    hostname: string | null;
    type: string | null;
};

function createPlatformStore() {
    const { subscribe, update, set } = writable<PlatformFormData>({
        name: null,
        key: null,
        hostname: null,
        type: null
    });

    return {
        subscribe,
        update,
        set,
        reset() {
            set({
                name: null,
                key: null,
                hostname: null,
                type: null
            });
        }
    };
}

export const createPlatform = createPlatformStore();
