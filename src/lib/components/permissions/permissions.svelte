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
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { symmetricDifference } from '$lib/helpers/array';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Actions from './actions.svelte';
    import Row from './row.svelte';
    import Table from '$lib/elements/table/table.svelte';

    export let withCreate = false;
    export let permissions: string[] = [];

    let showUser = false;
    let showTeam = false;
    let showLabel = false;
    let showCustom = false;
    let showDropdown = false;

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

        showDropdown = false;
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
        <Table noMargin noStyles>
            <TableHeader>
                <TableCellHead width={140}>Role</TableCellHead>
                {#if withCreate}
                    <TableCellHead width={60}>Create</TableCellHead>
                {/if}
                <TableCellHead width={50}>Read</TableCellHead>
                <TableCellHead width={60}>Update</TableCellHead>
                <TableCellHead width={60}>Delete</TableCellHead>
                <TableCellHead width={32} />
            </TableHeader>
            <TableBody>
                {#each [...$groups].sort(sortRoles) as [role, permission] (role)}
                    <TableRow>
                        <TableCell title="Role">
                            <Row {role} />
                        </TableCell>

                        {#if withCreate}
                            <TableCell title="Create">
                                <input
                                    type="checkbox"
                                    class="icon-check"
                                    aria-label="Create"
                                    checked={permission.create}
                                    on:change={() => togglePermission(role, 'create')} />
                            </TableCell>
                        {/if}
                        <TableCell title="Read">
                            <input
                                type="checkbox"
                                class="icon-check"
                                aria-label="Read"
                                checked={permission.read}
                                on:change={() => togglePermission(role, 'read')} />
                        </TableCell>
                        <TableCell title="Update">
                            <input
                                type="checkbox"
                                class="icon-check"
                                aria-label="Update"
                                checked={permission.update}
                                on:change={() => togglePermission(role, 'update')} />
                        </TableCell>
                        <TableCell title="Delete">
                            <input
                                type="checkbox"
                                class="icon-check"
                                aria-label="Delete"
                                checked={permission.delete}
                                on:change={() => togglePermission(role, 'delete')} />
                        </TableCell>

                        <TableCell title="Remove" width={40}>
                            <div class="u-flex">
                                <button
                                    class="button is-text is-only-icon"
                                    type="button"
                                    aria-label="delete"
                                    on:click={() => deleteRole(role)}>
                                    <span class="icon-x" aria-hidden="true" />
                                </button>
                            </div>
                        </TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
    </div>

    <Actions
        bind:showLabel
        bind:showCustom
        bind:showDropdown
        bind:showTeam
        bind:showUser
        {groups}
        on:create={create}>
        <Button text noMargin on:click={() => (showDropdown = !showDropdown)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Add role</span>
        </Button>
    </Actions>
{:else}
    <article class="card u-grid u-cross-center u-width-full-line dashed">
        <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
            <div class="common-section">
                <Actions
                    bind:showLabel
                    bind:showCustom
                    bind:showDropdown
                    bind:showTeam
                    bind:showUser
                    {groups}
                    on:create={create}>
                    <Button secondary round on:click={() => (showDropdown = !showDropdown)}>
                        <i class="icon-plus" />
                    </Button>
                </Actions>
            </div>
            <div class="common-section">
                <span class="text"> Add a role to get started </span>
            </div>
        </div>
    </article>
{/if}

<style lang="scss">
    .table-wrapper {
        scrollbar-width: none;
        -ms-overflow-style: none;

        &::-webkit-scrollbar {
            display: none;
        }
    }
</style>
