import { browser } from '$app/environment';
import { writable, type Writable } from 'svelte/store';

export function cachedStore<TModel, TMethods = Record<string, unknown>>(
    id: string,
    callback: (store: Writable<TModel>) => TMethods
): TMethods & Writable<TModel> {
    const store = writable<TModel>(browser ? JSON.parse(sessionStorage.getItem(id)) : null);

    if (browser) {
        store.subscribe((n) => sessionStorage?.setItem(id, JSON.stringify(n ?? '')));
    }

    return {
        subscribe: store.subscribe,
        set: store.set,
        update: store.update,
        ...callback(store)
    };
}
