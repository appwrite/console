<script lang="ts">
    import {
        Table,
        TableBody,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { difference } from '$lib/helpers/array';
    import { onDestroy, onMount } from 'svelte';
    import { writable, type Unsubscriber } from 'svelte/store';
    import Actions from './actions.svelte';
    import type { Permission } from './permissions.svelte';
    import Row from './row.svelte';

    export let roles: string[] = [];

    let showUser = false;
    let showTeam = false;
    let showCustom = false;
    let showDropdown = false;
    let unsubscribe: Unsubscriber;

    const groups = writable<Map<string, Permission>>(new Map());

    onMount(() => {
        roles.forEach(addRole);
        unsubscribe = groups.subscribe((n) => {
            const current = Array.from(n.keys());
            if (difference(current, roles).length || difference(roles, current).length) {
                roles = current;
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
</script>

<Table noMargin noStyles noMobile>
    <TableHeader>
        <TableCellHead>Role</TableCellHead>
        <TableCellHead width={40} />
    </TableHeader>
    <TableBody>
        {#each [...$groups.keys()] as role}
            <TableRow>
                <TableCellText title="Role">
                    <Row {role} />
                </TableCellText>
                <TableCellText title="Remove">
                    <div class="u-flex">
                        <button
                            class="button is-text is-only-icon"
                            type="button"
                            aria-label="delete"
                            on:click={() => deleteRole(role)}>
                            <span class="icon-x" aria-hidden="true" />
                        </button>
                    </div>
                </TableCellText>
            </TableRow>
        {/each}
    </TableBody>
</Table>

<Actions
    bind:showCustom
    bind:showDropdown
    bind:showTeam
    bind:showUser
    {groups}
    on:create={create} />
