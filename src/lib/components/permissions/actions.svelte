<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { Button } from '$lib/elements/forms';
    import { DropList, DropListItem } from '..';
    import Custom from './custom.svelte';
    import Team from './team.svelte';
    import User from './user.svelte';
    import type { Permission } from './permissions.svelte';
    import type { Writable } from 'svelte/store';

    export let showDropdown: boolean;
    export let showUser: boolean;
    export let showTeam: boolean;
    export let showCustom: boolean;
    export let groups: Writable<Map<string, Permission>>;

    const dispatch = createEventDispatcher();

    $: if (showUser || showTeam || showCustom) {
        showDropdown = false;
    }
</script>

<DropList bind:show={showDropdown} placement="bottom-end">
    <Button text noMargin on:click={() => (showDropdown = !showDropdown)}>
        <span class="icon-plus" aria-hidden="true" />
        <span class="text">Add role</span>
    </Button>
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
        <DropListItem on:click={() => (showCustom = true)}>Custom permission</DropListItem>
    </svelte:fragment>
</DropList>

<User bind:show={showUser} on:create {groups} />
<Team bind:show={showTeam} on:create {groups} />
<Custom bind:show={showCustom} on:create {groups} />
