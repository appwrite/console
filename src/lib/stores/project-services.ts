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
            { label: 'Account', method: ApiService.Account, value: null },
            { label: 'Avatars', method: ApiService.Avatars, value: null },
            { label: 'Databases', method: ApiService.Databases, value: null },
            { label: 'TablesDB', method: ApiService.Tablesdb, value: null },
            { label: 'Locale', method: ApiService.Locale, value: null },
            { label: 'Health', method: ApiService.Health, value: null },
            { label: 'Storage', method: ApiService.Storage, value: null },
            { label: 'Teams', method: ApiService.Teams, value: null },
            { label: 'Users', method: ApiService.Users, value: null },
            { label: 'Sites', method: ApiService.Sites, value: null },
            { label: 'Functions', method: ApiService.Functions, value: null },
            { label: 'GraphQL', method: ApiService.Graphql, value: null },
            { label: 'Messaging', method: ApiService.Messaging, value: null }
        ] satisfies Service[]
    });

    return {
        subscribe,
        set,
        load: (project: Models.Project) => {
            const list: Service[] = [
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
                    label: 'Tables',
                    method: ApiService.Tablesdb,
                    value: project.serviceStatusForTablesdb
                },
                {
                    label: 'Locale',
                    method: ApiService.Locale,
                    value: project.serviceStatusForLocale
                },
                {
                    label: 'Health',
                    method: ApiService.Health,
                    value: project.serviceStatusForHealth
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
                },
                {
                    label: 'Sites',
                    method: ApiService.Sites,
                    value: project.serviceStatusForSites
                },
                {
                    label: 'Functions',
                    method: ApiService.Functions,
                    value: project.serviceStatusForFunctions
                },
                {
                    label: 'GraphQL',
                    method: ApiService.Graphql,
                    value: project.serviceStatusForGraphql
                },
                {
                    label: 'Messaging',
                    method: ApiService.Messaging,
                    value: project.serviceStatusForMessaging
                }
            ];
            set({ list });
        }
    };
}

export const services = createServices();
