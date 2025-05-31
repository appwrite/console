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
    export let hideOnClick: boolean = false;
    export let groups: Writable<Map<string, Permission>>;

    const dispatch = createEventDispatcher();
</script>

<Popover let:toggle padding="none" placement="bottom-start">
    <slot {toggle} />
    <svelte:fragment slot="tooltip" let:hide>
        <ActionMenu.Root>
            <ActionMenu.Item.Button
                disabled={$groups.has('any')}
                on:click={(e) => {
                    if (hideOnClick) hide(e);
                    dispatch('create', ['any']);
                }}>
                Any
            </ActionMenu.Item.Button>
            <ActionMenu.Item.Button
                disabled={$groups.has('guests')}
                on:click={(e) => {
                    if (hideOnClick) hide(e);
                    dispatch('create', ['guests']);
                }}>
                All guests
            </ActionMenu.Item.Button>
            <ActionMenu.Item.Button
                disabled={$groups.has('users')}
                on:click={(e) => {
                    if (hideOnClick) hide(e);
                    dispatch('create', ['users']);
                }}>
                All users
            </ActionMenu.Item.Button>
            <ActionMenu.Item.Button
                on:click={(e) => {
                    showUser = true;
                    if (hideOnClick) hide(e);
                }}>Select users</ActionMenu.Item.Button>
            <ActionMenu.Item.Button
                on:click={(e) => {
                    showTeam = true;
                    if (hideOnClick) hide(e);
                }}>Select teams</ActionMenu.Item.Button>
            <ActionMenu.Item.Button
                on:click={(e) => {
                    showLabel = true;
                    if (hideOnClick) hide(e);
                }}>Label</ActionMenu.Item.Button>
            <ActionMenu.Item.Button
                on:click={(e) => {
                    showCustom = true;
                    if (hideOnClick) hide(e);
                }}>Custom permission</ActionMenu.Item.Button>
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
