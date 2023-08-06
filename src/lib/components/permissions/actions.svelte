<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import { DropList, DropListItem } from '..';
    import Custom from './custom.svelte';
    import Team from './team.svelte';
    import User from './user.svelte';
    import type { Permission } from './permissions.svelte';
    import type { Writable } from 'svelte/store';
    import LL from '$i18n/i18n-svelte';

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
    <slot />
    <svelte:fragment slot="list">
        <DropListItem disabled={$groups.has('any')} on:click={() => dispatch('create', ['any'])}>
            {$LL.console.project.button.dropdown.any()}
        </DropListItem>
        <DropListItem
            disabled={$groups.has('guests')}
            on:click={() => dispatch('create', ['guests'])}>
            {$LL.console.project.button.dropdown.allGuests()}
        </DropListItem>
        <DropListItem
            disabled={$groups.has('users')}
            on:click={() => dispatch('create', ['users'])}>
            {$LL.console.project.button.dropdown.allUsers()}
        </DropListItem>
        <DropListItem on:click={() => (showUser = true)}
            >{$LL.console.project.button.dropdown.selectUsers()}</DropListItem>
        <DropListItem on:click={() => (showTeam = true)}
            >{$LL.console.project.button.dropdown.selectTeams()}</DropListItem>
        <DropListItem on:click={() => (showCustom = true)}
            >{$LL.console.project.button.dropdown.currentPermission()}</DropListItem>
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
<Custom bind:show={showCustom} on:create {groups} />
