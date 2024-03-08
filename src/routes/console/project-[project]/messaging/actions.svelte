<script lang="ts">
    import { DropList, DropListItem } from '$lib/components';
    import { createEventDispatcher } from 'svelte';
    import { targetsById } from './wizard/store';
    import UserTargetsModal from './userTargetsModal.svelte';
    import TopicsModal from './topicsModal.svelte';
    import { topicsById } from './store';
    import type { MessagingProviderType } from '@appwrite.io/console';

    export let showDropdown: boolean;
    export let showUserTargets: boolean;
    export let showTopics: boolean;
    export let providerType: MessagingProviderType = null;

    const dispatch = createEventDispatcher();

    $: if (showUserTargets || showTopics) {
        showDropdown = false;
    }
</script>

<DropList bind:show={showDropdown} placement="bottom-end" fixed>
    <slot />
    <svelte:fragment slot="list">
        <DropListItem on:click={() => (showTopics = true)}>Select topics</DropListItem>
        <DropListItem on:click={() => (showUserTargets = true)}>Select targets</DropListItem>
    </svelte:fragment>
</DropList>

<TopicsModal
    {providerType}
    bind:show={showTopics}
    bind:topicsById={$topicsById}
    on:update={(e) => {
        showTopics = false;
        dispatch('addTopics', e.detail);
    }} />
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
