import { Dependencies, PAGE_LIMIT } from '$lib/constants';
import { getLimit, getPage, getSearch, pageToOffset } from '$lib/helpers/load';
import { sdk } from '$lib/stores/sdk';
import { isSelfHosted } from '$lib/system';
import { Query } from '@appwrite.io/console';
import { error, redirect } from '@sveltejs/kit';
import { base } from '$app/paths';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ url, params, route, depends, parent }) => {
    await parent();
    depends(Dependencies.CONSOLE_USERS);

    // Platform-wide console user management is self-hosted only.
    // Cloud multi-tenancy must not expose cross-organization user listings.
    if (!isSelfHosted) {
        redirect(303, `${base}/organization-${params.organization}`);
    }

    const page = getPage(url);
    const search = getSearch(url);
    const limit = getLimit(url, route, PAGE_LIMIT);
    const offset = pageToOffset(page, limit);

    try {
        const users = await sdk.forConsoleInOrganization(params.organization).users.list({
            queries: [Query.limit(limit), Query.offset(offset), Query.orderDesc('$createdAt')],
            search: search || undefined
        });

        return {
            offset,
            limit,
            search,
            users
        };
    } catch (e) {
        throw error(e?.code || 500, e?.message || 'Failed to load console users');
    }
};
