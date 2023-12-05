<script lang="ts">
    import { DropList, DropListItem } from '$lib/components';
    import { createEventDispatcher } from 'svelte';
    import { targetsById } from './wizard/store';
    import UserTargetsModal from './userTargetsModal.svelte';
    import type { ProviderTypes } from './providerType.svelte';
    import TopicsModal from './topicsModal.svelte';
    import { topicsById } from './store';

    export let showDropdown: boolean;
    export let showUserTargets: boolean;
    export let showTopics: boolean;
    export let providerType: ProviderTypes = null;

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
    bind:show={showTopics}
    bind:topicsById={$topicsById}
    on:update={(e) => {
        showTopics = false;
        dispatch('addTopics', e.detail);
    }} />
<UserTargetsModal
    {providerType}
    bind:show={showUserTargets}
    bind:targetsById={$targetsById}
    on:update={(e) => {
        showUserTargets = false;
        dispatch('addTargets', e.detail);
    }} />
