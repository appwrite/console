import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { sdk } from '$lib/stores/sdk';
import { base } from '$app/paths';
import { page } from '$app/stores';

export const topicsSearcher = (async (query: string) => {
    const $page = get(page);
    const { topics } = await sdk
        .forProject($page.params.region, $page.params.project)
        .messaging.listTopics([], query || undefined);

    return topics
        .filter((topic) => topic.name.toLowerCase().includes(query.toLowerCase()))
        .map(
            (topic) =>
                ({
                    group: 'topics',
                    label: topic.name,
                    callback: () => {
                        goto(
                            `${base}/project-${$page.params.region}-${$page.params.project}/messaging/topics/topic-${topic.$id}`
                        );
                    },
                    icon: 'send'
                }) as const
        );
}) satisfies Searcher;
