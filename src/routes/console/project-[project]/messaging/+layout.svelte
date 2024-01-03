<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { project } from '../store';
    import { showCreate } from './store';

    // TODO: finalize the commands

    $: $registerCommands([
        {
            label: 'Create message',
            callback: () => {
                if (!$page.url.pathname.endsWith('messaging')) {
                    goto(`/console/project-${$project.$id}/messaging`);
                }
                $showCreate = true;
            },
            keys: $page.url.pathname.endsWith('messaging') ? ['c'] : ['c', 'm'],
            icon: 'plus',
            group: 'messaging'
        },
        {
            label: 'Go to topics',
            callback() {
                goto(`/console/project-${$project.$id}/messaging/topics`);
            },
            keys: ['g', 't'],
            disabled:
                $page.url.pathname.endsWith('topics') || $page.url.pathname.includes('message-'),
            group: 'navigation',
            rank: 10
        },
        {
            label: 'Go to providers',
            callback() {
                goto(`/console/project-${$project.$id}/messaging/providers`);
            },
            keys: ['g', 'p'],
            disabled:
                $page.url.pathname.endsWith('topics') || $page.url.pathname.includes('message-'),
            group: 'navigation',
            rank: 10
        }
        // {
        //     label: 'Find messages',
        //     callback: () => {
        //         addSubPanel(BucketsPanel);
        //     },
        //     group: 'messaging',
        //     rank: -1
        // }
    ]);

    $: $updateCommandGroupRanks({ messaging: 200, navigation: 100 });
</script>

<svelte:head>
    <title>Messaging - Appwrite</title>
</svelte:head>

<slot />
