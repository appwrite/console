import { writable } from 'svelte/store';
import { ServiceId, type Models } from '@appwrite.io/console';

export type Service = {
    label: string;
    method: ServiceId;
    value: boolean | null;
};

function projectServiceRows(project: Models.Project | null): Service[] {
    const rows: Service[] = [
        {
            label: 'Account',
            method: ServiceId.Account,
            value: project?.serviceStatusForAccount ?? null
        },
        {
            label: 'Avatars',
            method: ServiceId.Avatars,
            value: project?.serviceStatusForAvatars ?? null
        },
        {
            label: 'Databases',
            method: ServiceId.Databases,
            value: project?.serviceStatusForDatabases ?? null
        },
        {
            label: 'Functions',
            method: ServiceId.Functions,
            value: project?.serviceStatusForFunctions ?? null
        },
        {
            label: 'GraphQL',
            method: ServiceId.Graphql,
            value: project?.serviceStatusForGraphql ?? null
        },
        {
            label: 'Health',
            method: ServiceId.Health,
            value: project?.serviceStatusForHealth ?? null
        },
        {
            label: 'Locale',
            method: ServiceId.Locale,
            value: project?.serviceStatusForLocale ?? null
        },
        {
            label: 'Messaging',
            method: ServiceId.Messaging,
            value: project?.serviceStatusForMessaging ?? null
        },
        {
            label: 'Migrations',
            method: ServiceId.Migrations,
            value: project?.serviceStatusForMigrations ?? null
        },
        {
            label: 'Project',
            method: ServiceId.Project,
            value: project?.serviceStatusForProject ?? null
        },
        // @todo Re-enable when Proxy is ready for public release.
        // {
        //     label: 'Proxy',
        //     method: ServiceId.Proxy,
        //     value: project?.serviceStatusForProxy ?? null
        // },
        {
            label: 'Sites',
            method: ServiceId.Sites,
            value: project?.serviceStatusForSites ?? null
        },
        {
            label: 'Storage',
            method: ServiceId.Storage,
            value: project?.serviceStatusForStorage ?? null
        },
        {
            label: 'TablesDB',
            method: ServiceId.Tablesdb,
            value: project?.serviceStatusForTablesdb ?? null
        },
        {
            label: 'Teams',
            method: ServiceId.Teams,
            value: project?.serviceStatusForTeams ?? null
        },
        {
            label: 'Users',
            method: ServiceId.Users,
            value: project?.serviceStatusForUsers ?? null
        }
        // @todo Re-enable when VCS is ready for public release.
        // {
        //     label: 'VCS',
        //     method: ServiceId.Vcs,
        //     value: project?.serviceStatusForVcs ?? null
        // }
    ];

    return rows.sort((a, b) => a.label.localeCompare(b.label));
}

function createServices() {
    const { subscribe, set } = writable({
        list: projectServiceRows(null)
    });

    return {
        subscribe,
        set,
        load: (project: Models.Project) => {
            set({ list: projectServiceRows(project) });
        }
    };
}

export const services = createServices();
