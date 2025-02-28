<script context="module" lang="ts">
    export type Permission = {
        create: boolean;
        read: boolean;
        update: boolean;
        delete: boolean;
    };

    export type PermissionsTypes = 'create' | 'read' | 'update' | 'delete';
</script>

<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Actions from './actions.svelte';
    import Row from './row.svelte';
    import { Icon, Selector, Table } from '@appwrite.io/pink-svelte';
    import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';

    export let withCreate = false;
    export let permissions: string[] = [];

    let showUser = false;
    let showTeam = false;
    let showLabel = false;
    let showCustom = false;

    const groups = writable<Map<string, Permission>>(new Map());

    onMount(() => {
        permissions.forEach(fromPermissionString);
        return groups.subscribe(() => {
            const current = exportRoles();
            if (symmetricDifference(current, permissions).length) {
                permissions = current;
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
            n.set(role, {
                create: false,
                read: false,
                update: false,
                delete: false
            });

            return n;
        });
    }

    function fromPermissionString(permission: string): void {
        const type = permission.slice(0, permission.indexOf('('));
        const role = permission.slice(permission.indexOf('("') + 2, permission.indexOf('")'));

        groups.update((n) => {
            if (!n.has(role)) {
                n.set(role, {
                    create: false,
                    read: false,
                    update: false,
                    delete: false
                });
            }
            n.get(role)[type] = true;

            return n;
        });
    }

    function togglePermission(role: string, permission: PermissionsTypes): void {
        groups.update((n) => {
            n.get(role)[permission] = !n.get(role)[permission];

            return n;
        });
    }

    function deleteRole(role: string): void {
        groups.update((n) => {
            n.delete(role);

            return n;
        });
    }

    function exportRoles() {
        return [...$groups].reduce((prev, [role, permission]) => {
            ['create', 'read', 'update', 'delete'].forEach((type) => {
                if (permission[type] === true) {
                    prev.push(`${type}("${role}")`);
                }
            });

            return prev;
        }, []);
    }

    function sortRoles([a]: [string, Permission], [b]: [string, Permission]) {
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
</script>

{#if [...$groups]?.length}
    <div class="table-wrapper">
        <Table.Root>
            <svelte:fragment slot="header">
                <Table.Header.Cell>Role</Table.Header.Cell>
                {#if withCreate}
                    <Table.Header.Cell width="90px">Create</Table.Header.Cell>
                {/if}
                <Table.Header.Cell width="90px">Read</Table.Header.Cell>
                <Table.Header.Cell width="90px">Update</Table.Header.Cell>
                <Table.Header.Cell width="90px">Delete</Table.Header.Cell>
                <Table.Header.Cell width="40px" />
            </svelte:fragment>
            {#each [...$groups].sort(sortRoles) as [role, permission] (role)}
                <Table.Row>
                    <Table.Cell>
                        <Row {role} />
                    </Table.Cell>

                    {#if withCreate}
                        <Table.Cell>
                            <Selector.Checkbox
                                checked={permission.create}
                                on:change={() => togglePermission(role, 'create')} />
                        </Table.Cell>
                    {/if}
                    <Table.Cell>
                        <Selector.Checkbox
                            size="s"
                            checked={permission.read}
                            on:change={() => togglePermission(role, 'read')} />
                    </Table.Cell>
                    <Table.Cell>
                        <Selector.Checkbox
                            size="s"
                            checked={permission.update}
                            on:change={() => togglePermission(role, 'update')} />
                    </Table.Cell>
                    <Table.Cell>
                        <Selector.Checkbox
                            size="s"
                            checked={permission.delete}
                            on:change={() => togglePermission(role, 'delete')} />
                    </Table.Cell>

                    <Table.Cell>
                        <Button compact icon ariaLabel="delete" on:click={() => deleteRole(role)}>
                            <Icon icon={IconX} size="s" />
                        </Button>
                    </Table.Cell>
                </Table.Row>
            {/each}
        </Table.Root>
    </div>

    <div>
        <Actions
            bind:showLabel
            bind:showCustom
            bind:showTeam
            bind:showUser
            {groups}
            on:create={create}
            let:toggle>
            <Button secondary on:click={toggle}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add role
            </Button>
        </Actions>
    </div>
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
                <span class="text"> Add a role to get started </span>
            </div>
        </div>
    </article>
{/if}
