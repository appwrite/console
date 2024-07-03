<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { Drop, Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import type { Column } from '$lib/helpers/types';
    import type { Writable } from 'svelte/store';
    import Content from './content.svelte';
    import { addFilter, queries, queriesAreDirty, queryParamToMap, tags } from './store';

    export let query = '[]';
    export let columns: Writable<Column[]>;
    export let disabled = false;
    export let fullWidthMobile = false;
    export let singleCondition = false;

    const parsedQueries = queryParamToMap(query);
    queries.set(parsedQueries);

    /* eslint  @typescript-eslint/no-explicit-any: 'off' */
    let value: any = null;
    let selectedColumn: string | null = null;
    let operatorKey: string | null = null;
    let arrayValues: string[] = [];

    // We need to separate them so we don't trigger Drop's handlers
    let showFiltersDesktop = false;
    let showFiltersMobile = false;

    let applied = $tags.length;

    beforeNavigate(() => {
        applied = $tags.length;
        showFiltersDesktop = false;
        showFiltersMobile = false;
    });

    function clearAll() {
        selectedColumn = null;
        queries.clearAll();
    }

    function apply() {
        if (selectedColumn && operatorKey && (value || arrayValues.length)) {
            addFilter($columns, selectedColumn, operatorKey, value, arrayValues);
            selectedColumn = null;
            value = null;
            operatorKey = null;
            arrayValues = [];
        }
        queries.apply();
    }

    function afterApply(
        e: CustomEvent<{
            applied: number;
        }>
    ) {
        applied = e.detail.applied;
        if (singleCondition) {
            showFiltersDesktop = false;
            showFiltersMobile = false;
        }
    }

    $: if (!showFiltersDesktop && !showFiltersMobile) {
        selectedColumn = null;
        value = null;
        operatorKey = null;
        arrayValues = [];
    }

    $: isButtonDisabled = $queriesAreDirty
        ? false
        : !selectedColumn || !operatorKey || (!value && !arrayValues.length);

    function toggleDropdown() {
        showFiltersDesktop = !showFiltersDesktop;
    }
    function toggleMobileModal() {
        showFiltersMobile = !showFiltersMobile;
    }
</script>

<div class="is-not-mobile">
    <Drop bind:show={showFiltersDesktop} noArrow>
        <slot {disabled} toggle={toggleDropdown}>
            <Button secondary on:click={toggleDropdown} {disabled}>
                <i class="icon-filter u-opacity-50" />
                Filters
                {#if applied > 0}
                    <span class="inline-tag">
                        {applied}
                    </span>
                {/if}
            </Button>
        </slot>
        <svelte:fragment slot="list">
            <div class="dropped card">
                <p>Apply filter rules to refine the table view</p>
                <Content
                    bind:columnId={selectedColumn}
                    bind:operatorKey
                    bind:value
                    bind:arrayValues
                    {columns}
                    {singleCondition}
                    on:apply={afterApply}
                    on:clear={() => (applied = 0)} />
                <hr />
                <div class="u-flex u-margin-block-start-16 u-main-end u-gap-8">
                    {#if singleCondition}
                        <Button text on:click={toggleDropdown}>Cancel</Button>
                    {:else}
                        <Button text on:click={clearAll}>Clear all</Button>
                    {/if}
                    <Button on:click={apply} disabled={isButtonDisabled}>Apply</Button>
                </div>
            </div>
        </svelte:fragment>
    </Drop>
</div>

<div class="is-only-mobile">
    <slot name="mobile" {disabled} toggle={toggleMobileModal}>
        <Button
            secondary
            on:click={() => (showFiltersMobile = !showFiltersMobile)}
            {fullWidthMobile}>
            <i class="icon-filter u-opacity-50" />
            Filters
            {#if applied > 0}
                <span class="inline-tag">
                    {applied}
                </span>
            {/if}
        </Button>
    </slot>

    <Modal
        title="Filters"
        description="Apply filter rules to refine the table view"
        bind:show={showFiltersMobile}
        size="big">
        <Content
            {columns}
            bind:columnId={selectedColumn}
            bind:operatorKey
            bind:value
            bind:arrayValues
            {singleCondition}
            on:apply={afterApply}
            on:clear={() => (applied = 0)} />
        <svelte:fragment slot="footer">
            {#if singleCondition}
                <Button text on:click={() => (showFiltersMobile = false)}>Cancel</Button>
            {:else}
                <Button text on:click={clearAll}>Clear all</Button>
            {/if}
            <Button on:click={apply} disabled={isButtonDisabled}>Apply</Button>
        </svelte:fragment>
    </Modal>
</div>

<style lang="scss">
    .dropped {
        border-radius: 0.5rem;
        box-shadow: 0px 16px 32px 0px rgba(55, 59, 77, 0.04);

        padding: 1rem;
        margin-top: 0.5rem;

        width: 37.5rem;

        hr {
            height: 1px;
            width: calc(100% + 2rem);
            background-color: hsl(var(--color-border));

            margin-block-start: 1rem;
            margin-inline: -1rem;
        }
    }
</style>
