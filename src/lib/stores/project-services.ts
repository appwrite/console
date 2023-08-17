import { writable } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

export type Service = {
    label: string;
    method: string;
    value: boolean | null;
};

function createServices() {
    const { subscribe, set } = writable({
        list: [
            {
                label: 'Account',
                method: 'account',
                value: null
            },
            {
                label: 'Avatars',
                method: 'avatars',
                value: null
            },
            {
                label: 'Databases',
                method: 'databases',
                value: null
            },
            {
                label: 'Functions',
                method: 'functions',
                value: null
            },
            {
                label: 'Health',
                method: 'health',
                value: null
            },
            {
                label: 'Locale',
                method: 'locale',
                value: null
            },
            {
                label: 'Storage',
                method: 'storage',
                value: null
            },
            {
                label: 'Teams',
                method: 'teams',
                value: null
            },
            {
                label: 'Users',
                method: 'users',
                value: null
            },
            {
                label: 'GraphQL',
                method: 'graphql',
                value: null
            },
            {
                label: 'VCS',
                method: 'vcs',
                value: null
            },
            {
                label: 'Proxy',
                method: 'proxy',
                value: null
            }
        ]
    });

    return {
        subscribe,
        set,
        load: (project: Models.Project) => {
            const list = [
                {
                    label: 'Account',
                    method: 'account',
                    value: project.serviceStatusForAccount
                },
                {
                    label: 'Avatars',
                    method: 'avatars',
                    value: project.serviceStatusForAvatars
                },
                {
                    label: 'Databases',
                    method: 'databases',
                    value: project.serviceStatusForDatabases
                },
                {
                    label: 'Functions',
                    method: 'functions',
                    value: project.serviceStatusForFunctions
                },
                {
                    label: 'Health',
                    method: 'health',
                    value: project.serviceStatusForHealth
                },
                {
                    label: 'Locale',
                    method: 'locale',
                    value: project.serviceStatusForLocale
                },
                {
                    label: 'Storage',
                    method: 'storage',
                    value: project.serviceStatusForStorage
                },
                {
                    label: 'Teams',
                    method: 'teams',
                    value: project.serviceStatusForTeams
                },
                {
                    label: 'Users',
                    method: 'users',
                    value: project.serviceStatusForUsers
                }
            ];
            set({ list });
        }
    };
}

export const services = createServices();
