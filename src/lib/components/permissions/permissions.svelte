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
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { difference } from '$lib/helpers/array';
    import { onDestroy, onMount } from 'svelte';
    import { writable, type Unsubscriber } from 'svelte/store';
    import { Empty } from '../';
    import Actions from './actions.svelte';
    import Row from './row.svelte';

    export let withCreate = false;
    export let withCrud = true;
    export let permissions: string[] = [];
    export let executeAccess: string[] = [];

    let showUser = false;
    let showTeam = false;
    let showCustom = false;
    let showDropdown = false;
    let unsubscribe: Unsubscriber;

    const groups = writable<Map<string, Permission>>(new Map());

    onMount(() => {
        permissions.forEach(fromPermissionString);
        unsubscribe = groups.subscribe(() => {
            const current = exportRoles();
            if (
                difference(current, permissions).length ||
                difference(permissions, current).length
            ) {
                permissions = current;
            }
        });
    });

    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
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

    $: if (executeAccess.length && !permissions.length) {
        executeAccess.forEach((permission) => {
            addRole(permission);
        });
    }
    $: if ([...$groups]?.length && !permissions.length) {
        executeAccess = [...$groups].sort(sortRoles).map(([role]) => role);
    }

    //TODO: click on Empty components opens the dropdown
</script>

{#if [...$groups]?.length}
    <Table noMargin noStyles noMobile>
        <TableHeader>
            <TableCellHead>Role</TableCellHead>
            {#if withCrud}
                {#if withCreate}
                    <TableCellHead width={70}>Create</TableCellHead>
                {/if}
                <TableCellHead width={70}>Read</TableCellHead>
                <TableCellHead width={70}>Update</TableCellHead>
                <TableCellHead width={70}>Delete</TableCellHead>
            {/if}
            <TableCellHead width={40} />
        </TableHeader>
        <TableBody>
            {#each [...$groups].sort(sortRoles) as [role, permission]}
                <TableRow>
                    <TableCellText title="Role">
                        <Row {role} />
                    </TableCellText>

                    {#if withCrud}
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
                    {/if}

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
{:else}
    <span class="eyebrow-heading-3 u-sep-block-end">ROLE</span>

    <Empty isButton on:click={() => (showDropdown = !showDropdown)}>
        Add a role to get started
    </Empty>
{/if}

<Actions
    bind:showCustom
    bind:showDropdown
    bind:showTeam
    bind:showUser
    {groups}
    on:create={create} />
