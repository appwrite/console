<script lang="ts">
    import { Button, InputSearch } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Query, type Models } from '@appwrite.io/console';
    import { AvatarInitials, EmptySearch, Modal, PaginationInline } from '..';
    import type { Writable } from 'svelte/store';
    import type { Permission } from './permissions.svelte';
    import Table from '$lib/elements/table/table.svelte';
    import { TableBody, TableCell, TableRow } from '$lib/elements/table';
    import { page } from '$app/stores';

    export let show: boolean;
    export let groups: Writable<Map<string, Permission>>;

    const dispatch = createEventDispatcher();

    let search = '';
    let offset = 0;
    let results: Models.TeamList<Record<string, unknown>>;
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
        results = await sdk
            .forProject($page.params.region, $page.params.project)
            .teams.list([Query.limit(5), Query.offset(offset)], search || undefined);
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

<Modal title="Select teams" bind:show onSubmit={create} on:close={reset} size="big">
    <p class="text">
        Grant access to any member of a specific team. To grant access to team members with specific
        roles, you will need to set a <button
            type="button"
            class="link"
            on:click={() => dispatch('custom')}>custom permission</button
        >.
    </p>
    <InputSearch
        autofocus
        disabled={!results?.teams?.length && !search}
        placeholder="Search by name or ID"
        bind:value={search} />
    {#if results?.teams?.length}
        <div class="table-wrapper">
            <Table noStyles isAutoLayout tag="table">
                <TableBody>
                    {#each results.teams as team (team.$id)}
                        {@const role = `team:${team.$id}`}
                        {@const exists = $groups.has(role)}
                        <TableRow>
                            <TableCell title="Enabled" width={40}>
                                <input
                                    id={team.$id}
                                    type="checkbox"
                                    class="icon-check"
                                    aria-label="Create"
                                    checked={exists || selected.has(role)}
                                    disabled={exists}
                                    on:change={(event) => onSelection(event, role)} />
                            </TableCell>
                            <TableCell title="Team">
                                <label class="u-flex u-cross-center u-gap-8" for={team.$id}>
                                    <AvatarInitials size={32} name={team.name} />
                                    <div class="u-line-height-1-5">
                                        <div class="body-text-2 u-bold">{team.name}</div>
                                        <div class="u-x-small">{team.$id}</div>
                                    </div>
                                </label>
                            </TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
        </div>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {results?.total}</p>
            <PaginationInline limit={5} bind:offset sum={results?.total} hidePages />
        </div>
    {:else if search}
        <EmptySearch hidePages>
            <div class="common-section">
                <div class="u-text-center common-section">
                    <b class="body-text-2 u-bold">Sorry we couldn't find "{search}"</b>
                    <p>There are no teams that match your search.</p>
                </div>
                <div class="u-flex u-gap-16 common-section u-main-center">
                    <Button external href="https://appwrite.io/docs/products/auth/teams" text
                        >Documentation</Button>
                    <Button secondary on:click={() => (search = '')}>Clear search</Button>
                </div>
            </div>
        </EmptySearch>
    {:else}
        <EmptySearch hidePages>
            <div class="common-section">
                <div class="u-text-center common-section">
                    <p class="text u-line-height-1-5">
                        You have no teams. Create a team to see them here.
                    </p>
                    <p class="text u-line-height-1-5">
                        Need a hand? Learn more in our <a
                            href="https://appwrite.io/docs/products/auth/teams"
                            target="_blank"
                            rel="noopener noreferrer">
                            documentation</a
                        >.
                    </p>
                </div>
            </div>
        </EmptySearch>
    {/if}

    <svelte:fragment slot="footer">
        <Button submit disabled={!hasSelection}>Add</Button>
    </svelte:fragment>
</Modal>
