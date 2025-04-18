<script lang="ts">
    import { Button } from '$lib/elements/forms';

    import { symmetricDifference } from '$lib/helpers/array';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Actions from './actions.svelte';
    import type { Permission } from './permissions.svelte';
    import Row from './row.svelte';
    import { Card, Icon, Layout, Table } from '@appwrite.io/pink-svelte';
    import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';

    export let roles: string[] = [];

    let showUser = false;
    let showTeam = false;
    let showLabel = false;
    let showCustom = false;

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
    <Layout.Stack>
        <Table.Root columns={[{ id: 'role' }, { id: 'action', width: 40 }]} let:root>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="role" {root}>Role</Table.Header.Cell>
                <Table.Header.Cell column="action" {root} />
            </svelte:fragment>
            {#each [...$groups.keys()].sort(sortRoles) as role}
                <Table.Row.Base {root}>
                    <Table.Cell column="role" {root}>
                        <Row {role} />
                    </Table.Cell>
                    <Table.Cell column="action" {root}>
                        <Layout.Stack justifyContent="flex-end">
                            <Button compact icon on:click={() => deleteRole(role)}>
                                <Icon icon={IconX} size="s" />
                            </Button>
                        </Layout.Stack>
                    </Table.Cell>
                </Table.Row.Base>
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
            <div>
                <Button compact on:click={toggle}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Add role
                </Button>
            </div>
        </Actions>
    </Layout.Stack>
{:else}
    <Card.Base>
        <Layout.Stack justifyContent="center" alignItems="center" gap="m">
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
            <span class="text">Add a role </span>
        </Layout.Stack>
    </Card.Base>
{/if}
