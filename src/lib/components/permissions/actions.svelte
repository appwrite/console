<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { DropList, DropListItem } from '..';
    import Label from './label.svelte';
    import Custom from './custom.svelte';
    import Team from './team.svelte';
    import User from './user.svelte';
    import type { Permission } from './permissions.svelte';
    import type { Writable } from 'svelte/store';

    export let showDropdown: boolean;
    export let showUser: boolean;
    export let showTeam: boolean;
    export let showLabel: boolean;
    export let showCustom: boolean;
    export let groups: Writable<Map<string, Permission>>;

    const dispatch = createEventDispatcher();

    $: if (showUser || showTeam || showCustom) {
        showDropdown = false;
    }
</script>

<DropList bind:show={showDropdown} placement="bottom-end" fixed>
    <slot />
    <svelte:fragment slot="list">
        <DropListItem disabled={$groups.has('any')} on:click={() => dispatch('create', ['any'])}>
            Any
        </DropListItem>
        <DropListItem
            disabled={$groups.has('guests')}
            on:click={() => dispatch('create', ['guests'])}>
            All guests
        </DropListItem>
        <DropListItem
            disabled={$groups.has('users')}
            on:click={() => dispatch('create', ['users'])}>
            All users
        </DropListItem>
        <DropListItem on:click={() => (showUser = true)}>Select users</DropListItem>
        <DropListItem on:click={() => (showTeam = true)}>Select teams</DropListItem>
        <DropListItem on:click={() => (showLabel = true)}>Label</DropListItem>
        <DropListItem on:click={() => (showCustom = true)}>Custom permission</DropListItem>
    </svelte:fragment>
</DropList>

<User bind:show={showUser} on:create {groups} />
<Team
    bind:show={showTeam}
    on:create
    on:custom={() => {
        showTeam = false;
        showCustom = true;
    }}
    {groups} />
<Label bind:show={showLabel} on:create {groups} />
<Custom bind:show={showCustom} on:create {groups} />
