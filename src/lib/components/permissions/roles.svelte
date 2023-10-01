<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { symmetricDifference } from '$lib/helpers/array';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import Actions from './actions.svelte';
    import type { Permission } from './permissions.svelte';
    import Row from './row.svelte';

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
    <Table noMargin noStyles>
        <TableHeader>
            <TableCellHead width={70}>Role</TableCellHead>
            <TableCellHead width={40} />
        </TableHeader>
        <TableBody>
            {#each [...$groups.keys()].sort(sortRoles) as role}
                <TableRow>
                    <TableCell title="Role">
                        <Row {role} />
                    </TableCell>
                    <TableCellText title="Remove">
                        <div class="u-flex u-main-end">
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
