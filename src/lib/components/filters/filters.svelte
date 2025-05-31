<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import type { Column } from '$lib/helpers/types';
    import type { Writable } from 'svelte/store';
    import Content from './content.svelte';
    import {
        addFilter,
        queries,
        queriesAreDirty,
        queryParamToMap,
        tags,
        ValidOperators
    } from './store';
    import { createEventDispatcher } from 'svelte';
    import { Icon, Layout, Popover } from '@appwrite.io/pink-svelte';
    import { IconFilter, IconFilterLine } from '@appwrite.io/pink-icons-svelte';
    import { Click, Submit, trackEvent } from '$lib/actions/analytics';

    export let query = '[]';
    export let columns: Writable<Column[]>;
    export let disabled = false;
    export let fullWidthMobile = false;
    export let singleCondition = false;
    export let clearOnClick = false; // When enabled the user doesn't have to click apply to clear the filters
    export let enableApply = false;
    export let quickFilters = false;
    export let analyticsSource = '';
    let displayQuickFilters = quickFilters;

    const dispatch = createEventDispatcher();
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
        if (clearOnClick) {
            trackEvent(Submit.FilterClear, { source: analyticsSource });
            queries.apply();
        }
    }

    function apply() {
        if (quickFilters && displayQuickFilters) {
            trackEvent(Submit.FilterApply, { source: analyticsSource });
            dispatch('apply');
        } else if (
            selectedColumn &&
            operatorKey &&
            (operatorKey === ValidOperators.IsNotNull ||
                operatorKey === ValidOperators.IsNull ||
                value ||
                arrayValues.length)
        ) {
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

    $: isButtonDisabled =
        $queriesAreDirty || (quickFilters && displayQuickFilters && enableApply)
            ? false
            : !selectedColumn ||
              !operatorKey ||
              (!value &&
                  !arrayValues.length &&
                  operatorKey !== ValidOperators.IsNotNull &&
                  operatorKey !== ValidOperators.IsNull);

    function toggleDropdown() {
        dispatch('toggle', { show: !showFiltersDesktop });
        showFiltersDesktop = !showFiltersDesktop;
    }
    function toggleMobileModal() {
        dispatch('toggle', { show: !showFiltersMobile });
        showFiltersMobile = !showFiltersMobile;
    }
</script>

<div class="is-not-mobile">
    <Popover let:toggle placement="bottom-start">
        <Button
            secondary
            on:click={(event) => {
                toggle(event);
                trackEvent(Click.FilterApplyClick, { source: analyticsSource });
            }}
            {disabled}>
            <Icon icon={IconFilterLine} slot="start" size="s" />
            Filters
            {#if applied > 0}
                <span class="inline-tag">
                    {applied}
                </span>
            {/if}
        </Button>
        <svelte:fragment slot="tooltip">
            <div style:width="420px">
                <Layout.Stack gap="s">
                    {#if displayQuickFilters}
                        <slot name="quick" />
                    {:else}
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
                    {/if}
                    <div
                        class="u-flex u-cross-center u-margin-block-start-16"
                        class:u-main-end={!quickFilters}
                        class:u-main-space-between={quickFilters}>
                        {#if quickFilters}
                            <Button
                                text
                                on:click={() => (displayQuickFilters = !displayQuickFilters)}
                                class="u-margin-block-end-auto">
                                {displayQuickFilters ? 'Advanced filters' : 'Quick filters'}
                            </Button>
                        {/if}
                        <div class="u-flex u-gap-8">
                            {#if singleCondition}
                                <Button size="s" text on:click={toggleDropdown}>Cancel</Button>
                            {:else}
                                <Button size="s" disabled={applied === 0} text on:click={clearAll}>
                                    Clear all
                                </Button>
                            {/if}
                            <Button size="s" on:click={apply} disabled={isButtonDisabled}
                                >Apply</Button>
                        </div>
                    </div>
                </Layout.Stack>
            </div>
        </svelte:fragment>
    </Popover>
</div>

<div class="is-only-mobile">
    <slot name="mobile" {disabled} toggle={toggleMobileModal}>
        <Button size="s" secondary on:click={toggleMobileModal} {fullWidthMobile}>
            <Icon icon={IconFilter} slot="start" size="s" />
            Filters
            {#if applied > 0}
                <span class="inline-tag">
                    {applied}
                </span>
            {/if}
        </Button>
    </slot>

    <Modal title="Filters" bind:show={showFiltersMobile}>
        <span slot="description"> Apply filter rules to refine the table view </span>
        {#if displayQuickFilters}
            <slot name="quick" />
        {:else}
            <Content
                {columns}
                bind:columnId={selectedColumn}
                bind:operatorKey
                bind:value
                bind:arrayValues
                {singleCondition}
                on:apply={afterApply}
                on:clear={() => (applied = 0)} />
        {/if}
        <svelte:fragment slot="footer">
            <div
                class="u-flex u-cross-center u-width-full-line"
                class:u-main-end={!quickFilters}
                class:u-main-space-between={quickFilters}>
                {#if quickFilters}
                    <Button
                        text
                        on:click={() => (displayQuickFilters = !displayQuickFilters)}
                        class="u-margin-block-end-auto">
                        {displayQuickFilters ? 'Advanced filters' : 'Quick filters'}
                    </Button>
                {/if}
                <div class="u-flex u-gap-8">
                    {#if singleCondition}
                        <Button size="s" text on:click={() => (showFiltersMobile = false)}
                            >Cancel</Button>
                    {:else}
                        <Button size="s" text on:click={clearAll}>Clear all</Button>
                    {/if}
                    <Button size="s" on:click={apply} disabled={isButtonDisabled}>Apply</Button>
                </div>
            </div>
        </svelte:fragment>
    </Modal>
</div>
