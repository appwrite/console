import { writable } from 'svelte/store';
import { APIService, type Models } from '@appwrite.io/console';

export type Service = {
    label: string;
    method: APIService;
    value: boolean | null;
};

function createServices() {
    const { subscribe, set } = writable({
        list: [
            {
                label: 'Account',
                method: APIService.Account,
                value: null
            },
            {
                label: 'Avatars',
                method: APIService.Avatars,
                value: null
            },
            {
                label: 'Databases',
                method: APIService.Databases,
                value: null
            },
            {
                label: 'Functions',
                method: APIService.Functions,
                value: null
            },
            {
                label: 'Health',
                method: APIService.Health,
                value: null
            },
            {
                label: 'Locale',
                method: APIService.Locale,
                value: null
            },
            {
                label: 'Storage',
                method: APIService.Storage,
                value: null
            },
            {
                label: 'Teams',
                method: APIService.Teams,
                value: null
            },
            {
                label: 'Users',
                method: APIService.Users,
                value: null
            },
            {
                label: 'GraphQL',
                method: APIService.Graphql,
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
                    method: APIService.Account,
                    value: project.serviceStatusForAccount
                },
                {
                    label: 'Avatars',
                    method: APIService.Avatars,
                    value: project.serviceStatusForAvatars
                },
                {
                    label: 'Databases',
                    method: APIService.Databases,
                    value: project.serviceStatusForDatabases
                },
                {
                    label: 'Functions',
                    method: APIService.Functions,
                    value: project.serviceStatusForFunctions
                },
                {
                    label: 'Health',
                    method: APIService.Health,
                    value: project.serviceStatusForHealth
                },
                {
                    label: 'Locale',
                    method: APIService.Locale,
                    value: project.serviceStatusForLocale
                },
                {
                    label: 'Storage',
                    method: APIService.Storage,
                    value: project.serviceStatusForStorage
                },
                {
                    label: 'Teams',
                    method: APIService.Teams,
                    value: project.serviceStatusForTeams
                },
                {
                    label: 'Users',
                    method: APIService.Users,
                    value: project.serviceStatusForUsers
                }
            ];
            set({ list });
        }
    };
}

export const services = createServices();
