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
    import { difference } from '$lib/helpers/array';
    import { onDestroy, onMount } from 'svelte';
    import { writable, type Unsubscriber } from 'svelte/store';
    import { DropList, DropListItem } from '..';
    import Custom from './custom.svelte';
    import Row from './row.svelte';
    import Team from './team.svelte';
    import User from './user.svelte';

    export let withCreate = false;
    export let permissions: string[] = [];

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
</script>

<div class="table-with-scroll">
    <div class="table-wrapper">
        <table class="table is-table-layout-auto is-remove-outer-styles">
            <thead class="table-thead">
                <tr class="table-row">
                    <th class="table-thead-col">
                        <span class="eyebrow-heading-3">Role</span>
                    </th>
                    {#if withCreate}
                        <th class="table-thead-col" style="--p-col-width:70">
                            <span class="eyebrow-heading-3">Create</span>
                        </th>
                    {/if}
                    <th class="table-thead-col" style="--p-col-width:70">
                        <span class="eyebrow-heading-3">Read</span>
                    </th>
                    <th class="table-thead-col" style="--p-col-width:70">
                        <span class="eyebrow-heading-3">Update</span>
                    </th>
                    <th class="table-thead-col" style="--p-col-width:70">
                        <span class="eyebrow-heading-3">Delete</span>
                    </th>
                    <th class="table-thead-col" style="--p-col-width:40" />
                </tr>
            </thead>
            <tbody class="table-tbody">
                {#each [...$groups].sort(sortRoles) as [role, permission]}
                    <tr class="table-row">
                        <td class="table-col" data-title="Role">
                            <Row {role} />
                        </td>
                        {#if withCreate}
                            <td class="table-col" data-title="Create">
                                <input
                                    type="checkbox"
                                    class="icon-check"
                                    aria-label="Create"
                                    checked={permission.create}
                                    on:change={() => togglePermission(role, 'create')} />
                            </td>
                        {/if}
                        <td class="table-col" data-title="Read">
                            <input
                                type="checkbox"
                                class="icon-check"
                                aria-label="Read"
                                checked={permission.read}
                                on:change={() => togglePermission(role, 'read')} />
                        </td>
                        <td class="table-col" data-title="Update">
                            <input
                                type="checkbox"
                                class="icon-check"
                                aria-label="Update"
                                checked={permission.update}
                                on:change={() => togglePermission(role, 'update')} />
                        </td>
                        <td class="table-col" data-title="Delete">
                            <input
                                type="checkbox"
                                class="icon-check"
                                aria-label="Delete"
                                checked={permission.delete}
                                on:change={() => togglePermission(role, 'delete')} />
                        </td>
                        <td class="table-col u-overflow-visible">
                            <div class="u-flex">
                                <button
                                    class="button is-text is-only-icon"
                                    type="button"
                                    aria-label="delete"
                                    on:click={() => deleteRole(role)}>
                                    <span class="icon-x" aria-hidden="true" />
                                </button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
<DropList
    bind:show={showDropdown}
    position="bottom"
    horizontal="right"
    arrow={true}
    arrowPosition="start">
    <Button text noMargin on:click={() => (showDropdown = !showDropdown)}>
        <span class="icon-plus" aria-hidden="true" />
        <span class="text">Add role</span>
    </Button>
    <svelte:fragment slot="list">
        <DropListItem disabled={$groups.has('any')} on:click={() => addRole('any')}>
            Any
        </DropListItem>
        <DropListItem disabled={$groups.has('guests')} on:click={() => addRole('guests')}>
            All guests
        </DropListItem>
        <DropListItem disabled={$groups.has('users')} on:click={() => addRole('users')}>
            All users
        </DropListItem>
        <DropListItem on:click={() => (showUser = true)}>Select users</DropListItem>
        <DropListItem on:click={() => (showTeam = true)}>Select teams</DropListItem>
        <DropListItem on:click={() => (showCustom = true)}>Custom permission</DropListItem>
    </svelte:fragment>
</DropList>

<User bind:show={showUser} on:create={create} {groups} />
<Team bind:show={showTeam} on:create={create} {groups} />
<Custom bind:show={showCustom} on:create={create} {groups} />
