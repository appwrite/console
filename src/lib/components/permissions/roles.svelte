<script lang="ts">
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

<div class="table-with-scroll">
    <div class="table-wrapper">
        <table class="table is-table-layout-auto is-remove-outer-styles">
            <thead class="table-thead">
                <tr class="table-row">
                    <th class="table-thead-col">
                        <span class="eyebrow-heading-3">Role</span>
                    </th>
                    <th class="table-thead-col" style="--p-col-width:40" />
                </tr>
            </thead>
            <tbody class="table-tbody">
                {#each [...$groups.keys()] as role}
                    <tr class="table-row">
                        <td class="table-col" data-title="Role">
                            <Row {role} />
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

<Actions
    bind:showCustom
    bind:showDropdown
    bind:showTeam
    bind:showUser
    {groups}
    on:create={create} />
