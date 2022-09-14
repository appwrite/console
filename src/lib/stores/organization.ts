import { sdkForConsole } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { get } from 'svelte/store';
import { base } from '$app/paths';
import { goto } from '$app/navigation';
import { cachedStore } from '$lib/helpers/cache';

export const newOrgModal = writable<boolean>(false);
export const newMemberModal = writable<boolean>(false);

export const organizationList = cachedStore<
    Models.TeamList,
    {
        load: () => Promise<void>;
    }
>('organizationList', function ({ set }) {
    return {
        load: async () => {
            const response = await sdkForConsole.teams.list();
            set(response);
        }
    };
});

export const organization = cachedStore<
    Models.Team,
    {
        load: (teamId: string) => Promise<void>;
    }
>('organization', function ({ set }) {
    return {
        load: async (teamId) => {
            const response = await sdkForConsole.teams.get(teamId);
            set(response);
        }
    };
});

export const projectList = cachedStore<
    Models.ProjectList,
    {
        load: (search: string, limit: number, offset: number) => Promise<void>;
    }
>('projectList', function ({ set }) {
    return {
        load: async (search, limit, offset) => {
            const response = await sdkForConsole.projects.list(
                search,
                limit,
                offset,
                undefined,
                undefined,
                'ASC'
            );
            set(response);
        }
    };
});

export const memberList = cachedStore<
    Models.MembershipList,
    {
        load: (teamId: string, search: string, limit: number, offset: number) => Promise<void>;
    }
>('memberList', function ({ set }) {
    return {
        load: async (teamId, search, limit, offset) => {
            const response = await sdkForConsole.teams.getMemberships(
                teamId,
                search,
                limit,
                offset
            );
            set(response);
        }
    };
});

export const redirectTo = async () => {
    let org = get(organization);
    if (org) {
        await goto(`${base}/console/organization-${org.$id}`);
    } else {
        await organizationList.load();
        const orgList = get(organizationList);
        if (orgList?.total) {
            await organization.load(orgList.teams[0].$id);
            org = get(organization);
            await goto(`${base}/console/organization-${org.$id}`);
        } else {
            newOrgModal.set(true);
            await goto(`${base}/console`);
        }
    }
};
