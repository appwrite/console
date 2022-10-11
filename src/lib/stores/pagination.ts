import { afterNavigate, goto } from '$app/navigation';
import { page } from '$app/stores';
import { get, writable } from 'svelte/store';

export function createPersistenPagination(limit: number) {
    const url = get(page).url;
    const current = +(url.searchParams.get('page') ?? 1);
    const offset = current * limit - limit;
    const { subscribe, set } = writable<number>(offset < 0 ? 0 : offset);

    let keepHistory = false;
    const apply = (n: number) => {
        const { pathname, searchParams, href } = get(page).url;
        const newPage = n / limit + 1;

        if (newPage > 1) {
            searchParams.set('page', newPage.toString());
        } else {
            searchParams.delete('page');
        }

        let target = pathname;

        const hasParams = Array.from(searchParams.keys()).length > 0;

        if (hasParams) {
            target += `?${searchParams.toString()}`;
        }

        if (keepHistory) {
            keepHistory = false;
            return;
        }

        if (href.endsWith(target)) {
            return;
        }

        goto(target, {
            noscroll: true
        });
    };

    afterNavigate(({ type, to }) => {
        if (type === 'popstate') {
            const target = +(to.url.searchParams.get('page') ?? 1);
            keepHistory = true;
            set(target * limit - limit);
        }
    });

    subscribe(apply);

    return {
        subscribe,
        set
    };
}
