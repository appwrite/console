<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { createFunction } from './store';
    import Create from '../createVariable.svelte';
    import { DropList, DropListItem, Copy } from '$lib/components';

    let showCreate = false;

    let selectedKey: string = null;
    let showDropdown = [];
    let showValue = [];
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
                            <div class="interactive-text-output">
                                {#if showValue[i]}
                                    <span class="text">{value}</span>
                                {:else}
                                    <span class="text">••••••••</span>
                                {/if}
                                <div class="u-flex u-cross-child-start u-gap-8">
                                    <button
                                        on:click|preventDefault={() =>
                                            (showValue[i] = !showValue[i])}
                                        class="interactive-text-output-button"
                                        aria-label="show hidden text">
                                        {#if showValue[i]}
                                            <span class="icon-eye-off" aria-hidden="true" />
                                        {:else}
                                            <span class="icon-eye" aria-hidden="true" />
                                        {/if}
                                    </button>
                                    <Copy {value}>
                                        <button
                                            class="interactive-text-output-button"
                                            aria-label="copy text">
                                            <span class="icon-duplicate" aria-hidden="true" />
                                        </button>
                                    </Copy>
                                </div>
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
                                    on:click|preventDefault={() =>
                                        (showDropdown[i] = !showDropdown[i])}>
                                    <span class="icon-dots-horizontal" aria-hidden="true" />
                                </button>
                                <svelte:fragment slot="list">
                                    <DropListItem
                                        icon="pencil"
                                        on:click={() => {
                                            selectedKey = key;
                                            showDropdown[i] = false;
                                            showCreate = true;
                                        }}>
                                        Edit
                                    </DropListItem>
                                    <DropListItem
                                        icon="trash"
                                        on:click={() => {
                                            delete $createFunction.vars[key];
                                            showDropdown[i] = false;
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

{#if showCreate}
    <Create bind:selectedKey bind:showCreate />
{/if}
