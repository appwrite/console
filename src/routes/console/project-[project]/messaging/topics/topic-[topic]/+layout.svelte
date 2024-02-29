<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { registerCommands } from '$lib/commandCenter';
    import { project } from '$routes/console/project-[project]/store';

    const topicId = $page.params.topic;

    $: $registerCommands([
        {
            label: 'Go to subscribers',
            callback() {
                goto(
                    `/console/project-${$project.$id}/messaging/topics/topic-${topicId}/subscribers`
                );
            },
            keys: ['g', 's'],
            disabled: $page.url.pathname.endsWith('subscribers'),
            group: 'navigation',
            rank: 1
        },
        {
            label: 'Go to activity',
            callback() {
                goto(`/console/project-${$project.$id}/messaging/topics/topic-${topicId}/activity`);
            },
            keys: ['g', 'a'],
            disabled: $page.url.pathname.endsWith('activity'),
            group: 'navigation',
            rank: 1
        }
    ]);
</script>

<svelte:head>
    <title>Topic - Appwrite</title>
</svelte:head>

<slot />
