import { writable } from 'svelte/store';
import { ApiService, type Models } from '@appwrite.io/console';

export type Service = {
    label: string;
    method: ApiService;
    value: boolean | null;
};

function createServices() {
    const { subscribe, set } = writable({
        list: [
            {
                label: 'Account',
                method: ApiService.Account,
                value: null
            },
            {
                label: 'Avatars',
                method: ApiService.Avatars,
                value: null
            },
            {
                label: 'Databases',
                method: ApiService.Databases,
                value: null
            },
            {
                label: 'Functions',
                method: ApiService.Functions,
                value: null
            },
            {
                label: 'Locale',
                method: ApiService.Locale,
                value: null
            },
            {
                label: 'Messaging',
                method: ApiService.Messaging,
                value: null
            },
            {
                label: 'Storage',
                method: ApiService.Storage,
                value: null
            },
            {
                label: 'Teams',
                method: ApiService.Teams,
                value: null
            },
            {
                label: 'Users',
                method: ApiService.Users,
                value: null
            },
            {
                label: 'GraphQL',
                method: ApiService.Graphql,
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
                    method: ApiService.Account,
                    value: project.serviceStatusForAccount
                },
                {
                    label: 'Avatars',
                    method: ApiService.Avatars,
                    value: project.serviceStatusForAvatars
                },
                {
                    label: 'Databases',
                    method: ApiService.Databases,
                    value: project.serviceStatusForDatabases
                },
                {
                    label: 'Functions',
                    method: ApiService.Functions,
                    value: project.serviceStatusForFunctions
                },
                {
                    label: 'Locale',
                    method: ApiService.Locale,
                    value: project.serviceStatusForLocale
                },
                {
                    label: 'Messaging',
                    method: ApiService.Messaging,
                    value: project.serviceStatusForMessaging
                },
                {
                    label: 'Storage',
                    method: ApiService.Storage,
                    value: project.serviceStatusForStorage
                },
                {
                    label: 'Teams',
                    method: ApiService.Teams,
                    value: project.serviceStatusForTeams
                },
                {
                    label: 'Users',
                    method: ApiService.Users,
                    value: project.serviceStatusForUsers
                }
            ];
            set({ list });
        }
    };
}

export const services = createServices();
