import { browser } from '$app/env';
import type { Writable } from 'svelte/store';

type Stores = {
    store: Partial<Writable<unknown>>;
    name: string;
}[];

export function cache(stores: Stores) {
    if (browser) {
        stores.forEach((item) => {
            item.store.subscribe((n) =>
                sessionStorage?.setItem(item.name, JSON.stringify(n ?? ''))
            );
        });
    }
}
