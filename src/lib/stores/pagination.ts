import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { get, writable } from 'svelte/store';

export function createPersistenPagination(limit: number) {
    const url = get(page).url;
    const current = +(url.searchParams.get('page') ?? 1);
    const offset = current * limit - limit;
    const { subscribe, set } = writable<number>(offset < 0 ? 0 : offset);

    subscribe((n) => {
        const { pathname, searchParams } = get(page).url;
        const newPage = n / limit + 1;
        if (newPage > 0) {
            searchParams.set('page', newPage.toString());
        } else {
            searchParams.delete('page');
        }
        let target = pathname;

        const hasParams = Array.from(searchParams.keys()).length > 0;

        if (hasParams) {
            target += `?${searchParams.toString()}`;
        }

        goto(target, {
            noscroll: true
        });
    });

    return {
        subscribe,
        set
    };
}
