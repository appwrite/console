<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { createFunction } from './store';
    import Create from '../createVariable.svelte';
    import { DropList, DropListItem } from '$lib/components';

    let showCreate = false;

    let selectedKey: string = null;
    let showDropdown = [];
</script>

<WizardStep>
    <svelte:fragment slot="title">Variables (optional)</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Create a variable (or secret key) that will be passed to your function at runtime.
    </svelte:fragment>

    <table class="table is-remove-outer-styles">
        <thead class="table-thead">
            <tr class="table-row">
                <th class="table-thead-col">
                    <span class="eyebrow-heading-3">Key</span>
                </th>
                <th class="table-thead-col">
                    <span class="eyebrow-heading-3">Value</span>
                </th>
                <th class="table-thead-col" style="--p-col-width:40" />
            </tr>
        </thead>
        <tbody class="table-tbody">
            {#if $createFunction.vars}
                {#each Object.entries($createFunction.vars) as [key, value], i}
                    <tr class="table-row">
                        <td class="table-col" data-title="Key">
                            <span class="text">{key}</span>
                        </td>
                        <td class="table-col u-overflow-visible" data-title="value">
                            <div class="transparent-password-input">
                                <button
                                    on:click|preventDefault={() =>
                                        (showDropdown[i] = !showDropdown[i])}
                                    aria-label="show password">
                                    <span class="icon-eye" aria-hidden="true" />
                                </button>
                                <input type="password" class="input-text" {value} />
                            </div>
                        </td>
                        <td class="table-col u-overflow-visible" data-title="options">
                            <DropList
                                bind:show={showDropdown[i]}
                                position="bottom"
                                horizontal="left"
                                arrow={false}>
                                <button
                                    class="button is-text is-only-icon"
                                    aria-label="more options"
                                    on:click|preventDefault={() => (showDropdown[i] = true)}>
                                    <span class="icon-dots-horizontal" aria-hidden="true" />
                                </button>
                                <svelte:fragment slot="list">
                                    <DropListItem
                                        icon="pencil"
                                        on:click={() => {
                                            selectedKey = key;
                                            showCreate = true;
                                        }}>
                                        Edit
                                    </DropListItem>
                                    <DropListItem
                                        icon="trash"
                                        on:click={() => {
                                            delete $createFunction.vars[key];
                                        }}>
                                        Delete
                                    </DropListItem>
                                </svelte:fragment>
                            </DropList>
                        </td>
                    </tr>
                {/each}
            {/if}
        </tbody>
    </table>
    <div class="u-flex u-margin-block-start-16">
        <button
            class="button is-text u-padding-inline-0"
            type="button"
            on:click={() => {
                showCreate = true;
            }}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create variable</span>
        </button>
    </div>
</WizardStep>

<Create key={selectedKey} {showCreate} />
