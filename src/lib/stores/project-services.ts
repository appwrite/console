import { writable } from 'svelte/store';
import { ProjectServiceId as ProjectServiceId, type Models } from '@appwrite.io/console';

export type Service = {
    label: string;
    method: ProjectServiceId;
    value: boolean | null;
};

function projectServiceRows(project: Models.Project | null): Service[] {
    const services = new Map(project?.services?.map((service) => [service.$id, service.enabled]));

    const rows: Service[] = [
        {
            label: 'Account',
            method: ProjectServiceId.Account,
            value: services.get(ProjectServiceId.Account) ?? null
        },
        {
            label: 'Avatars',
            method: ProjectServiceId.Avatars,
            value: services.get(ProjectServiceId.Avatars) ?? null
        },
        {
            label: 'Databases',
            method: ProjectServiceId.Databases,
            value: services.get(ProjectServiceId.Databases) ?? null
        },
        {
            label: 'Functions',
            method: ProjectServiceId.Functions,
            value: services.get(ProjectServiceId.Functions) ?? null
        },
        {
            label: 'Locale',
            method: ProjectServiceId.Locale,
            value: services.get(ProjectServiceId.Locale) ?? null
        },
        {
            label: 'Messaging',
            method: ProjectServiceId.Messaging,
            value: services.get(ProjectServiceId.Messaging) ?? null
        },
        {
            label: 'Migrations',
            method: ProjectServiceId.Migrations,
            value: services.get(ProjectServiceId.Migrations) ?? null
        },
        {
            label: 'Project',
            method: ProjectServiceId.Project,
            value: services.get(ProjectServiceId.Project) ?? null
        },
        // @todo Re-enable when Proxy is ready for public release.
        // {
        //     label: 'Proxy',
        //     method: ProjectServiceId.Proxy,
        //     value: project?.serviceStatusForProxy ?? null
        // },
        {
            label: 'Sites',
            method: ProjectServiceId.Sites,
            value: services.get(ProjectServiceId.Sites) ?? null
        },
        {
            label: 'Storage',
            method: ProjectServiceId.Storage,
            value: services.get(ProjectServiceId.Storage) ?? null
        },
        {
            label: 'TablesDB',
            method: ProjectServiceId.Tablesdb,
            value: services.get(ProjectServiceId.Tablesdb) ?? null
        },
        {
            label: 'Teams',
            method: ProjectServiceId.Teams,
            value: services.get(ProjectServiceId.Teams) ?? null
        },
        {
            label: 'Users',
            method: ProjectServiceId.Users,
            value: services.get(ProjectServiceId.Users) ?? null
        }
        // @todo Re-enable when VCS is ready for public release.
        // {
        //     label: 'VCS',
        //     method: ProjectServiceId.Vcs,
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
