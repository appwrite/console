import { goto } from '$app/navigation';
import { organization } from '$lib/stores/organization';
import { sdk, getApiEndpoint } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { project } from '$routes/(console)/project-[region]-[project]/store';
import { base } from '$app/paths';

export const projectsSearcher = (async (query: string) => {
    const q = query.toLowerCase().trim();
    const wantsCredentials =
        q.includes('endpoint') ||
        q.includes('api key') ||
        q.includes('api-key') ||
        q.includes('apikey') ||
        q.includes('project id') ||
        q.includes('project-id') ||
        q === 'id' ||
        q.endsWith(' id') ||
        q.startsWith('end') ||
        q.includes('api end') ||
        (q.includes('api') && q.includes('end'));

    if (wantsCredentials) {
        const curr = get(project);
        if (curr?.$id) {
            return [
                {
                    label: 'Go to Settings',
                    callback: () => {
                        goto(`${base}/project-${curr.region}-${curr.$id}/settings`);
                    },
                    group: 'navigation'
                }
            ];
        }
        return [];
    }

    const { projects } = await sdk.forConsole.projects.list({
        queries: [Query.equal('teamId', get(organization).$id), Query.orderDesc('')]
    });

    return projects
        .filter((project) => {
            const endpoint = getApiEndpoint(project.region);
            const searchable = [project.name, project.$id, project.region, endpoint]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const words = q.split(/\s+/).filter(Boolean);
            return words.every((w) => searchable.includes(w));
        })
        .flatMap((project) => {
            const href = `${base}/project-${project.region}-${project.$id}`;

            const label = project.name;

            return [
                {
                    label,
                    callback: () => {
                        goto(href);
                    },
                    group: 'projects'
                }
            ];
        });
}) satisfies Searcher;
