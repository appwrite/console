<script lang="ts">
    import { Button, Form, InputSearch } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import { Avatar, Modal, Pagination } from '..';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Query, type Models } from '@aw-labs/appwrite-console';
    import type { Writable } from 'svelte/store';
    import type { Permission } from './permissions.svelte';

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
        results = await sdkForProject.users.list([Query.limit(5), Query.offset(offset)], search);
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

{#if show}
    <Form noStyle noMargin on:submit={create}>
        <Modal bind:show on:close={reset} size="big">
            <svelte:fragment slot="header">Select users</svelte:fragment>
            <InputSearch bind:value={search} />
            {#if results?.users}
                <div class="table-wrapper">
                    <table class="table is-table-layout-auto is-remove-outer-styles">
                        <tbody class="table-tbody">
                            {#each results.users as user (user.$id)}
                                {@const role = `user:${user.$id}`}
                                {@const exists = $groups.has(role)}
                                <tr class="table-row">
                                    <td
                                        class="table-col"
                                        data-title="Enabled"
                                        style="--p-col-width:40">
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
                                            <Avatar
                                                src={sdkForProject.avatars
                                                    .getInitials(user.name, 64, 64)
                                                    .toString()}
                                                size={32}
                                                name={user.name} />
                                            <div class="u-line-height-1-5">
                                                <div class="body-text-2">{user.name}</div>
                                                <div class="u-x-small">{user.$id}</div>
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
{/if}
