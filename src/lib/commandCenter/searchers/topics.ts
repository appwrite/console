import { goto } from '$app/navigation';
import { project } from '$routes/(console)/project-[region]-[project]/store';
import { get } from 'svelte/store';
import type { Searcher } from '../commands';
import { sdk } from '$lib/stores/sdk';
import { base } from '$app/paths';
import { IconChevronRight } from '@appwrite.io/pink-icons-svelte';

export const topicsSearcher = (async (query: string) => {
    const { topics } = await sdk.forProject.messaging.listTopics([], query || undefined);

    const projectId = get(project).$id;

    return topics
        .filter((topic) => topic.name.toLowerCase().includes(query.toLowerCase()))
        .map(
            (topic) =>
                ({
                    group: 'topics',
                    label: topic.name,
                    callback: () => {
                        goto(`${base}/project-${projectId}/messaging/topics/topic-${topic.$id}`);
                    },
                    icon: IconChevronRight // TODO: @itznotabug - 'send' no replacement yet.
                }) as const
        );
}) satisfies Searcher;
