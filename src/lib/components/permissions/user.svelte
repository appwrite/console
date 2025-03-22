<script lang="ts">
    import { Button, InputSearch } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import { AvatarInitials, EmptySearch, Modal, PaginationInline } from '..';
    import { sdk } from '$lib/stores/sdk';
    import { Query, type Models } from '@appwrite.io/console';
    import type { Writable } from 'svelte/store';
    import type { Permission } from './permissions.svelte';
    import { page } from '$app/stores';

    export let show: boolean;
    export let groups: Writable<Map<string, Permission>>;

    const dispatch = createEventDispatcher();

    let search = '';
    let offset = 0;
    let results: Models.UserList<Record<string, unknown>>;
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
            .users.list([Query.limit(5), Query.offset(offset)], search || undefined);
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

<Modal title="Select users" bind:show onSubmit={create} on:close={reset} size="big">
    <p class="text">Grant access to any authenticated or anonymous user.</p>
    <InputSearch
        autofocus
        disabled={!results?.users?.length && !search}
        placeholder="Search by name, email, phone or ID"
        bind:value={search} />
    {#if results?.users?.length}
        <div class="table-wrapper">
            <table class="table is-table-layout-auto is-remove-outer-styles">
                <tbody class="table-tbody">
                    {#each results.users as user (user.$id)}
                        {@const role = `user:${user.$id}`}
                        {@const exists = $groups.has(role)}
                        <tr class="table-row">
                            <td class="table-col" data-title="Enabled" style="--p-col-width:40">
                                <input
                                    id={user.$id}
                                    type="checkbox"
                                    class="icon-check"
                                    aria-label="Create"
                                    checked={exists || selected.has(role)}
                                    disabled={exists}
                                    on:change={(event) => onSelection(event, role)} />
                            </td>
                            <td class="table-col" data-title="User">
                                <label class="u-flex u-cross-center u-gap-8" for={user.$id}>
                                    {#if user.email || user.phone}
                                        {#if user.name}
                                            <AvatarInitials size={32} name={user.name} />
                                            <div class="u-line-height-1-5">
                                                <div class="body-text-2 u-bold">
                                                    {user.name}
                                                </div>
                                                <div class="u-x-small">{user.$id}</div>
                                            </div>
                                        {:else}
                                            <div class="avatar is-size-small">
                                                <span class="icon-minus-sm" aria-hidden="true" />
                                            </div>
                                            <div class="u-line-height-1-5">
                                                <div class="body-text-2 u-bold">
                                                    {user.email ? user.email : user.phone}
                                                </div>
                                                <div class="u-x-small">{user.$id}</div>
                                            </div>
                                        {/if}
                                    {:else}
                                        <div class="avatar is-size-small">
                                            <span class="icon-anonymous" aria-hidden="true" />
                                        </div>
                                        <div class="u-line-height-1-5">
                                            <div class="body-text-2 u-bold">
                                                {user.name ? user.name : '-'}
                                            </div>
                                            <div class="u-x-small">{user.$id}</div>
                                        </div>
                                    {/if}
                                </label>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
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
                    <p>There are no Users that match your search.</p>
                </div>
                <div class="u-flex u-gap-16 common-section u-main-center">
                    <Button external href="https://appwrite.io/docs/products/auth/accounts" text
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
                        You have no users. Create a user to see them here.
                    </p>
                    <p class="text u-line-height-1-5">
                        Need a hand? Learn more in our <a
                            href="https://appwrite.io/docs/products/auth/quick-start"
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
