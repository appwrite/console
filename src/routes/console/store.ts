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
            const team = await sdkForConsole.teams.list();
            set(team);
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
            const team = await sdkForConsole.teams.get(teamId);
            set(team);
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
            const projects = await sdkForConsole.projects.list();
            set(projects);
        }
    };
}

export const organizationList = createOrganizationList();
export const organization = createOrganization();
export const projectList = createProjectList();

if (browser) {
    organizationList.subscribe((n) =>
        sessionStorage?.setItem('organizationList', JSON.stringify(n ?? ''))
    );
    organization.subscribe((n) => sessionStorage?.setItem('organization', JSON.stringify(n ?? '')));
    projectList.subscribe((n) => sessionStorage?.setItem('projectList', JSON.stringify(n ?? '')));
}
