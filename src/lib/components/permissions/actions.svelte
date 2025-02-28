<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import Label from './label.svelte';
    import Custom from './custom.svelte';
    import Team from './team.svelte';
    import User from './user.svelte';
    import type { Permission } from './permissions.svelte';
    import type { Writable } from 'svelte/store';
    import { ActionMenu, Popover } from '@appwrite.io/pink-svelte';

    export let showUser: boolean;
    export let showTeam: boolean;
    export let showLabel: boolean;
    export let showCustom: boolean;
    export let groups: Writable<Map<string, Permission>>;

    const dispatch = createEventDispatcher();
</script>

<Popover let:toggle padding="none" placement="bottom-start">
    <slot {toggle} />
    <svelte:fragment slot="tooltip">
        <ActionMenu.Root>
            <ActionMenu.Item.Button
                disabled={$groups.has('any')}
                on:click={() => dispatch('create', ['any'])}>
                Any
            </ActionMenu.Item.Button>
            <ActionMenu.Item.Button
                disabled={$groups.has('guests')}
                on:click={() => dispatch('create', ['guests'])}>
                All guests
            </ActionMenu.Item.Button>
            <ActionMenu.Item.Button
                disabled={$groups.has('users')}
                on:click={() => dispatch('create', ['users'])}>
                All users
            </ActionMenu.Item.Button>
            <ActionMenu.Item.Button on:click={() => (showUser = true)}
                >Select users</ActionMenu.Item.Button>
            <ActionMenu.Item.Button on:click={() => (showTeam = true)}
                >Select teams</ActionMenu.Item.Button>
            <ActionMenu.Item.Button on:click={() => (showLabel = true)}
                >Label</ActionMenu.Item.Button>
            <ActionMenu.Item.Button on:click={() => (showCustom = true)}
                >Custom permission</ActionMenu.Item.Button>
        </ActionMenu.Root>
    </svelte:fragment>
</Popover>

{#if showUser}
    <User bind:show={showUser} on:create {groups} />
{/if}
{#if showTeam}
    <Team
        bind:show={showTeam}
        on:create
        on:custom={() => {
            showTeam = false;
            showCustom = true;
        }}
        {groups} />
{/if}
{#if showLabel}
    <Label bind:show={showLabel} on:create {groups} />
{/if}
{#if showCustom}
    <Custom bind:show={showCustom} on:create {groups} />
{/if}
