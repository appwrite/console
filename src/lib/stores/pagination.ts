import { afterNavigate, goto } from '$app/navigation';
import { page } from '$app/stores';
import { QueryParams } from '$lib/helpers/load';
import { get, writable } from 'svelte/store';

export function createPersistentPagination(limit: number) {
    const url = get(page).url;
    const current = +(url.searchParams.get(QueryParams.Page) ?? 1);
    const offset = current * limit - limit;
    const { subscribe, set } = writable<number>(offset < 0 ? 0 : offset);

    let keepHistory = false;
    const apply = (n: number) => {
        const { pathname, searchParams, href } = get(page).url;
        const newPage = n / limit + 1;

        if (newPage > 1) {
            searchParams.set(QueryParams.Page, newPage.toString());
        } else {
            searchParams.delete(QueryParams.Page);
        }

        let target = pathname;

        const hasParams = searchParams.toString() !== '';

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
            noScroll: true
        });
    };

    afterNavigate(({ type, to }) => {
        const target = +(to.url.searchParams.get(QueryParams.Page) ?? 1);

        /**
         * Listens to back/forward of the browser.
         */
        if (type === 'popstate') {
            /**
             * Keep the history state of the browser.
             */
            keepHistory = true;
            set(target * limit - limit);
        } else if (type === 'link') {
            set(target * limit - limit);
        }
    });

    subscribe(apply);

    return {
        subscribe,
        set
    };
}
