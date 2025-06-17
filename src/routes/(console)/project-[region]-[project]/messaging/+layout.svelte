<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import {
        addSubPanel,
        registerCommands,
        registerSearchers,
        updateCommandGroupRanks
    } from '$lib/commandCenter';
    import { CreateMessagePanel } from '$lib/commandCenter/panels';
    import { messagesSearcher } from '$lib/commandCenter/searchers/messages';
    import { providersSearcher } from '$lib/commandCenter/searchers/providers';
    import { topicsSearcher } from '$lib/commandCenter/searchers/topics';
    import { canWriteMessages } from '$lib/stores/roles';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    // TODO: finalize the commands
    $: $registerCommands([
        {
            label: 'Create message',
            keys: page.url.pathname.endsWith('messaging') ? ['c'] : ['c', 'm'],
            callback() {
                addSubPanel(CreateMessagePanel);
            },
            icon: IconPlus,
            group: 'messaging',
            disabled: !$canWriteMessages
        },
        {
            label: 'Go to Topics',
            keys: ['g', 't'],
            callback() {
                goto(getProjectRoute('/messaging/topics'));
            },
            disabled:
                page.url.pathname.endsWith('topics') || page.url.pathname.includes('message-'),
            group: 'messaging',
            rank: 1
        },
        {
            label: 'Go to Providers',
            keys: ['g', 'p'],
            callback() {
                goto(getProjectRoute('/messaging/providers'));
            },
            disabled:
                page.url.pathname.endsWith('providers') || page.url.pathname.includes('message-'),
            group: 'messaging',
            rank: 2
        }
    ]);

    $registerSearchers(messagesSearcher, providersSearcher, topicsSearcher);

    $: $updateCommandGroupRanks({ messaging: 400, providers: 300, topics: 200, navigation: 100 });
</script>

<svelte:head>
    <title>Messaging - Appwrite</title>
</svelte:head>

<slot />
