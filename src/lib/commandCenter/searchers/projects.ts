import { goto } from '$app/navigation';
import { organization } from '$lib/stores/organization';
import { sdk } from '$lib/stores/sdk';
import { Query } from '@appwrite.io/console';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { project } from '$routes/(console)/project-[region]-[project]/store';
import { base } from '$app/paths';

export const projectsSearcher = (async (query: string) => {
    const q = query.toLowerCase().trim();
    const keywords = [
        'endpoint',
        'api key',
        'api-key',
        'apikey',
        'project id',
        'project-id',
        'api end'
    ];

    const wantsCredentials = keywords.some((k) => q.includes(k));

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
            const searchable = [project.name, project.$id, project.region]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            const words = q.split(/\s+/).filter(Boolean);
            return words.every((w) => searchable.includes(w));
        })
        .map((project) => {
            const href = `${base}/project-${project.region}-${project.$id}`;

            const label = project.name;

            return {
                label,
                callback: () => {
                    goto(href);
                },
                group: 'projects'
            };
        });
}) satisfies Searcher;
