import { goto } from '$app/navigation';
import type { Searcher } from '../commands';
import { sdk } from '$lib/stores/sdk';
import { IconChevronRight } from '@appwrite.io/pink-icons-svelte';
import { page } from '$app/state';
import { getProjectRoute } from '$lib/helpers/project';

export const topicsSearcher = (async (query: string) => {
    const { topics } = await sdk
        .forProject(page.params.region, page.params.project)
        .messaging.listTopics([], query || undefined);

    return topics
        .filter((topic) => topic.name.toLowerCase().includes(query.toLowerCase()))
        .map(
            (topic) =>
                ({
                    group: 'topics',
                    label: topic.name,
                    callback: () => goto(getProjectRoute(`/messaging/topics/topic-${topic.$id}`)),
                    icon: IconChevronRight // TODO: @itznotabug - 'send' no replacement yet.
                }) as const
        );
}) satisfies Searcher;
