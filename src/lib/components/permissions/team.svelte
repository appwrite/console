<script lang="ts">
    import { Button, Form, InputSearch } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Query, type Models } from '@aw-labs/appwrite-console';
    import { Avatar, Modal, Pagination } from '..';
    import type { Writable } from 'svelte/store';
    import type { Permission } from './permissions.svelte';

    export let show: boolean;
    export let groups: Writable<Map<string, Permission>>;

    const dispatch = createEventDispatcher();

    let search = '';
    let offset = 0;
    let results: Models.TeamList;
    let selected: Set<string> = new Set();
    let hasSelection = false;

    function reset() {
        offset = 0;
        search = '';
        selected.clear();
    }

    function create() {
        dispatch('create', Array.from(selected));
        reset();
    }

    async function request() {
        if (!show) return;
        results = await sdkForProject.teams.list([Query.limit(5), Query.offset(offset)], search);
    }

    function onSelection(event: Event, role: string) {
        const { checked } = event.currentTarget as HTMLInputElement;

        if (checked) {
            selected.add(role);
        } else {
            selected.delete(role);
        }

        hasSelection = selected.size > 0;
    }

    $: if (show) {
        request();
    }
    $: if (offset !== null) {
        request();
    }
    $: if (search !== null) {
        offset = 0;
        request();
    }
</script>

<Form on:submit={create} noMargin>
    <Modal bind:show on:close={reset} size="big">
        <svelte:fragment slot="header">Select teams</svelte:fragment>
        <InputSearch bind:value={search} />
        {#if results?.teams}
            <div class="table-wrapper">
                <table class="table is-table-layout-auto is-remove-outer-styles">
                    <tbody class="table-tbody">
                        {#each results.teams as team (team.$id)}
                            {@const role = `team:${team.$id}`}
                            {@const exists = $groups.has(role)}
                            <tr class="table-row">
                                <td class="table-col" data-title="Enabled" style="--p-col-width:40">
                                    <input
                                        id={team.$id}
                                        type="checkbox"
                                        class="icon-check"
                                        aria-label="Create"
                                        checked={exists || selected.has(role)}
                                        disabled={exists}
                                        on:change={(event) => onSelection(event, role)} />
                                </td>
                                <td class="table-col" data-title="Team">
                                    <label class="u-flex u-cross-center u-gap-8" for={team.$id}>
                                        <Avatar
                                            src={sdkForProject.avatars
                                                .getInitials(team.name, 64, 64)
                                                .toString()}
                                            size={32}
                                            name={team.name} />
                                        <div class="u-line-height-1-5">
                                            <div class="body-text-2">{team.name}</div>
                                            <div class="u-x-small">{team.$id}</div>
                                        </div>
                                    </label>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        {/if}
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {results?.total}</p>
            <Pagination limit={5} bind:offset sum={results?.total} hidePages />
        </div>
        <svelte:fragment slot="footer">
            <Button submit disabled={!hasSelection}>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
