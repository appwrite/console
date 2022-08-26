import { sdkForConsole } from '$lib/stores/sdk';
import type { Models } from '@aw-labs/appwrite-console';
import { writable } from 'svelte/store';
import { browser } from '$app/env';

function createOrganizationList() {
    const { subscribe, set } = writable<Models.TeamList>(
        browser ? JSON.parse(sessionStorage.getItem('organizationList')) : null
    );

    return {
        subscribe,
        set,
        load: async () => {
            const response = await sdkForConsole.teams.list();
            set(response);
        }
    };
}
function createOrganization() {
    const { subscribe, set } = writable<Models.Team>(
        browser ? JSON.parse(sessionStorage.getItem('organization')) : null
    );

    return {
        subscribe,
        set,
        load: async (teamId: string) => {
            const response = await sdkForConsole.teams.get(teamId);
            set(response);
        }
    };
}

function createProjectList() {
    const { subscribe, set } = writable<Models.ProjectList>(
        browser ? JSON.parse(sessionStorage.getItem('projectList')) : null
    );

    return {
        subscribe,
        set,
        load: async () => {
            const response = await sdkForConsole.projects.list();
            set(response);
        }
    };
}

function createMemberList() {
    const { subscribe, set } = writable<Models.MembershipList>(
        browser ? JSON.parse(sessionStorage.getItem('memberList')) : null
    );

    return {
        subscribe,
        set,
        load: async (teamId: string, search: string, limit: number, offset: number) => {
            const response = await sdkForConsole.teams.getMemberships(
                teamId,
                search,
                limit,
                offset
            );
            set(response);
        }
    };
}

export const organizationList = createOrganizationList();
export const organization = createOrganization();
export const projectList = createProjectList();
export const memberList = createMemberList();
export const newOrgModal = writable<boolean>(false);
export const newMemberModal = writable<boolean>(false);

if (browser) {
    organizationList.subscribe((n) =>
        sessionStorage?.setItem('organizationList', JSON.stringify(n ?? ''))
    );
    organization.subscribe((n) => sessionStorage?.setItem('organization', JSON.stringify(n ?? '')));
    projectList.subscribe((n) => sessionStorage?.setItem('projectList', JSON.stringify(n ?? '')));
    memberList.subscribe((n) => sessionStorage?.setItem('memberList', JSON.stringify(n ?? '')));
}
