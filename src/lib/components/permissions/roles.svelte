<script lang="ts">
    import { Button } from '$lib/elements/forms';

    import { symmetricDifference } from '$lib/helpers/array';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Actions from './actions.svelte';
    import type { Permission } from './permissions.svelte';
    import Row from './row.svelte';
    import { Icon, Layout, Table } from '@appwrite.io/pink-svelte';
    import { IconPlus, IconTable, IconX } from '@appwrite.io/pink-icons-svelte';

    export let roles: string[] = [];

    let showUser = false;
    let showTeam = false;
    let showLabel = false;
    let showCustom = false;
    let showDropdown = false;

    const groups = writable<Map<string, Permission>>(new Map());

    onMount(() => {
        roles.forEach(addRole);
        return groups.subscribe((n) => {
            const current = Array.from(n.keys());
            if (symmetricDifference(current, roles).length) {
                roles = current;
            }
        });
    });

    function create(event: CustomEvent<string[]>) {
        for (const role of event.detail) {
            addRole(role);
        }

        showTeam = showUser = false;
    }

    function addRole(role: string) {
        if ($groups.has(role)) {
            return;
        }

        groups.update((n) => {
            n.set(role, null);

            return n;
        });

        showDropdown = false;
    }

    function deleteRole(role: string): void {
        groups.update((n) => {
            n.delete(role);

            return n;
        });
    }

    function sortRoles(a: string, b: string) {
        if ((a === 'any') !== (b === 'any')) {
            return a === 'any' ? -1 : 1;
        }
        if ((a === 'users') !== (b === 'users')) {
            return a === 'users' ? -1 : 1;
        }
        if ((a === 'guests') !== (b === 'guests')) {
            return a === 'guests' ? -1 : 1;
        }

        return a.localeCompare(b);
    }

    $: if (roles) {
        roles.forEach(addRole);
    }
</script>

{#if [...$groups.keys()]?.length}
    <Table.Root>
        <svelte:fragment slot="header">
            <Table.Header.Cell>Role</Table.Header.Cell>
            <Table.Header.Cell width="40px" />
        </svelte:fragment>
        {#each [...$groups.keys()].sort(sortRoles) as role}
            <Table.Row>
                <Table.Cell>
                    <Row {role} />
                </Table.Cell>
                <Table.Cell>
                    <Layout.Stack justifyContent="flex-end">
                        <Button icon on:click={() => deleteRole(role)}>
                            <Icon icon={IconX} size="s" />
                        </Button>
                    </Layout.Stack>
                </Table.Cell>
            </Table.Row>
        {/each}
    </Table.Root>
    <Actions
        bind:showLabel
        bind:showCustom
        bind:showTeam
        bind:showUser
        {groups}
        on:create={create}
        let:toggle>
        <Button text on:click={toggle}>
            <Icon icon={IconPlus} slot="start" size="s" />
            Add role
        </Button>
    </Actions>
{:else}
    <article class="card u-grid u-cross-center u-width-full-line dashed">
        <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
            <div class="common-section">
                <Actions
                    bind:showLabel
                    bind:showCustom
                    bind:showTeam
                    bind:showUser
                    {groups}
                    on:create={create}
                    let:toggle>
                    <Button secondary icon on:click={toggle}>
                        <Icon icon={IconPlus} size="s" />
                    </Button>
                </Actions>
            </div>
            <div class="common-section">
                <span class="text"> Add a role </span>
            </div>
        </div>
    </article>
{/if}
