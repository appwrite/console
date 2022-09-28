<script lang="ts">
    import { Button, Form } from '$lib/elements/forms';
    import { createEventDispatcher, onMount } from 'svelte';
    import { Modal } from '..';
    import type { Writable } from 'svelte/store';
    import type { Permission } from './permissions.svelte';
    import InputSearch from '$lib/elements/forms/inputSearch.svelte';
    import { sdkForProject } from '$lib/stores/sdk';

    export let show: boolean;
    export let groups: Writable<Map<string, Permission>>;

    const dispatch = createEventDispatcher();

    let search = '';
    let results = [];
    let selected: Set<string> = new Set();

    onMount(request);

    function create() {
        dispatch('create', Array.from(selected));
    }

    async function request() {
        results = (await sdkForProject.teams.list([], search)).teams;
    }

    $: if (search !== null) {
        request();
    }
</script>

<Form on:submit={create}>
    <Modal bind:show>
        <svelte:fragment slot="header">Select team</svelte:fragment>
        <InputSearch bind:value={search} />
        <div class="table-wrapper">
            <table class="table is-table-layout-auto is-remove-outer-styles">
                <tbody class="table-tbody">
                    {#each results as team (team.$id)}
                        {@const role = `team:${team.$id}`}
                        <tr class="table-row">
                            <td class="table-col" data-title="Enabled" style="--p-col-width:40">
                                <input
                                    type="checkbox"
                                    class="icon-check"
                                    aria-label="Create"
                                    checked={selected.has(role)}
                                    on:change={() => selected.add(role)} />
                            </td>
                            <td class="table-col" data-title="Team">
                                <div class="u-flex u-cross-center u-gap-8">
                                    <div class="avatar is-size-small is-color-orange">
                                        <span class="text" aria-hidden="true">ch</span>
                                    </div>
                                    <div class="u-line-height-1-5">
                                        <div class="body-text-2">{team.name}</div>
                                        <div class="u-x-small">{team.$id}</div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
        <svelte:fragment slot="footer">
            <Button submit>Create</Button>
        </svelte:fragment>
    </Modal>
</Form>
