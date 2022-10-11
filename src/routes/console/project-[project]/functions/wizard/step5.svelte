<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { createFunction } from './store';
    import Create from '../createVariable.svelte';
    import { DropList, DropListItem, Copy } from '$lib/components';
    import type { Models } from '@aw-labs/appwrite-console';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';

    let showCreate = false;

    let selectedVar: Partial<Models.Variable> = null;
    let showDropdown = [];
    let showValue = [];

    function handleCreated(dispatchEvent: CustomEvent) {
        $createFunction.vars.push(dispatchEvent.detail);
        $createFunction = $createFunction;
    }
    function handleUpdated(dispatchEvent: CustomEvent) {
        $createFunction.vars = $createFunction.vars.map((v) => {
            if (v.key === selectedVar.key) {
                v.key = dispatchEvent.detail.key;
                v.value = dispatchEvent.detail.value;
            }
            return v;
        });
        $createFunction = $createFunction;
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Variables (optional)</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Create a variable (or secret key) that will be passed to your function at runtime.
    </svelte:fragment>

    <Table noStyles>
        <TableHeader>
            <TableCellHead>Key</TableCellHead>
            <TableCellHead>Value</TableCellHead>
            <TableCellHead width={30} />
        </TableHeader>

        <TableBody>
            {#if $createFunction.vars}
                {#each $createFunction.vars as variable, i}
                    <TableRow>
                        <TableCellText title="key">
                            {variable.key}
                        </TableCellText>
                        <TableCell showOverflow title="value">
                            <div class="interactive-text-output">
                                {#if showValue[i]}
                                    <span class="text">{variable.value}</span>
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
                                    <Copy bind:value={variable.value}>
                                        <button
                                            class="interactive-text-output-button"
                                            aria-label="copy text">
                                            <span class="icon-duplicate" aria-hidden="true" />
                                        </button>
                                    </Copy>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell showOverflow title="options">
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
                                            selectedVar = $createFunction.vars[i];
                                            showDropdown[i] = false;
                                            showCreate = true;
                                        }}>
                                        Edit
                                    </DropListItem>
                                    <DropListItem
                                        icon="trash"
                                        on:click={() => {
                                            $createFunction.vars.splice(i, 1);
                                            $createFunction = $createFunction;
                                            showDropdown[i] = false;
                                        }}>
                                        Delete
                                    </DropListItem>
                                </svelte:fragment>
                            </DropList>
                        </TableCell>
                    </TableRow>
                {/each}
            {/if}
        </TableBody>
    </Table>
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
    <Create
        bind:selectedVar
        bind:showCreate
        on:created={handleCreated}
        on:updated={handleUpdated} />
{/if}
