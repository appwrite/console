<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { registerCommands } from '$lib/commandCenter';
    import { project } from '$routes/(console)/project-[region]-[project]/store';

    const topicId = page.params.topic;

    $: $registerCommands([
        {
            label: 'Go to Subscribers',
            callback() {
                goto(
                    `${base}/project-${$project.region}-${$project.$id}/messaging/topics/topic-${topicId}/subscribers`
                );
            },
            keys: ['g', 's'],
            disabled: page.url.pathname.endsWith('subscribers'),
            group: 'topics',
            rank: 1
        },
        {
            label: 'Go to Activity',
            callback() {
                goto(
                    `${base}/project-${$project.region}-${$project.$id}/messaging/topics/topic-${topicId}/activity`
                );
            },
            keys: ['g', 'a'],
            disabled: page.url.pathname.endsWith('activity'),
            group: 'topics',
            rank: 1
        },
        {
            label: 'Go to Overview',
            callback() {
                goto(
                    `${base}/project-${$project.region}-${$project.$id}/messaging/topics/topic-${topicId}`
                );
            },
            keys: ['g', 'o'],
            disabled: page.url.pathname.endsWith(`topic-${topicId}`),
            group: 'topics',
            rank: 1
        }
    ]);
</script>

<svelte:head>
    <title>Topic - Appwrite</title>
</svelte:head>

<slot />
