import { writable } from 'svelte/store';
import { ApiService, type Models } from '@appwrite.io/console';

export type Service = {
    label: string;
    method: ApiService;
    value: boolean | null;
};

/** Same naming as `Models.Project` (`serviceStatusFor` + PascalCase of `ApiService` value). */
function apiServiceValueToStatusKey(value: string): `serviceStatusFor${string}` {
    const pascal = value.charAt(0).toUpperCase() + value.slice(1);
    return `serviceStatusFor${pascal}`;
}

function orderedApiServiceEnumKeys(): (keyof typeof ApiService)[] {
    return (Object.keys(ApiService) as (keyof typeof ApiService)[]).filter(
        (k) => typeof ApiService[k] === 'string'
    );
}

/** All client API services from `ApiService`, wired to `project.serviceStatusFor*`. */
function buildServiceRows(project: Models.Project | null): Service[] {
    return orderedApiServiceEnumKeys().map((enumKey) => {
        const method = ApiService[enumKey] as ApiService;
        const statusKey = apiServiceValueToStatusKey(method);

        const value =
            project && statusKey in project
                ? (project[statusKey as keyof Models.Project] as boolean)
                : null;

        return {
            label: String(enumKey),
            method,
            value
        };
    });
}

function createServices() {
    const { subscribe, set } = writable({
        list: buildServiceRows(null)
    });

    return {
        subscribe,
        set,
        load: (project: Models.Project) => {
            set({ list: buildServiceRows(project) });
        }
    };
}

export const services = createServices();
