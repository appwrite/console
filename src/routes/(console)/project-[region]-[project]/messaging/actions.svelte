<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { targetsById } from './wizard/store';
    import UserTargetsModal from './userTargetsModal.svelte';
    import TopicsModal from './topicsModal.svelte';
    import { topicsById } from './store';
    import type { MessagingProviderType } from '@appwrite.io/console';
    import { ActionMenu, Popover } from '@appwrite.io/pink-svelte';

    export let showUserTargets: boolean;
    export let showTopics: boolean;
    export let providerType: MessagingProviderType = null;

    const dispatch = createEventDispatcher();
</script>

<Popover let:toggle placement="bottom-start" padding="none">
    <slot {toggle} />
    <svelte:fragment slot="tooltip">
        <ActionMenu.Root>
            <ActionMenu.Item.Button on:click={() => (showTopics = true)}
                >Select topics</ActionMenu.Item.Button>
            <ActionMenu.Item.Button on:click={() => (showUserTargets = true)}
                >Select targets</ActionMenu.Item.Button>
        </ActionMenu.Root>
    </svelte:fragment>
</Popover>

{#if showTopics}
    <TopicsModal
        {providerType}
        bind:show={showTopics}
        bind:topicsById={$topicsById}
        on:update={(e) => {
            showTopics = false;
            dispatch('addTopics', e.detail);
        }} />
{/if}
{#if showUserTargets}
    <UserTargetsModal
        title="Select targets"
        {providerType}
        bind:show={showUserTargets}
        bind:targetsById={$targetsById}
        on:update={(e) => {
            showUserTargets = false;
            dispatch('addTargets', e.detail);
        }}>
        <svelte:fragment slot="description"
            >Select existing targets to which you want to send this message.</svelte:fragment>
    </UserTargetsModal>
{/if}
