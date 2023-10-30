<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { Drop, Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import type { Column } from '$lib/helpers/types';
    import type { Writable } from 'svelte/store';
    import Content from './content.svelte';
    import { queries, queriesAreDirty, queryParamToMap, tags } from './store';

    export let query = '[]';
    export let columns: Writable<Column[]>;

    const parsedQueries = queryParamToMap(query);
    queries.set(parsedQueries);

    // We need to separate them so we don't trigger Drop's handlers
    let showFiltersDesktop = false;
    let showFiltersMobile = false;

    let applied = $tags.length;

    beforeNavigate(() => {
        applied = $tags.length;
        showFiltersDesktop = false;
        showFiltersMobile = false;
    });
</script>

<div class="is-not-mobile">
    <Drop bind:show={showFiltersDesktop} noArrow>
        <Button secondary on:click={() => (showFiltersDesktop = !showFiltersDesktop)}>
            <i class="icon-filter u-opacity-50" />
            Filters
            {#if applied > 0}
                <span class="inline-tag">
                    {applied}
                </span>
            {/if}
        </Button>
        <svelte:fragment slot="list">
            <div class="dropped card">
                <p>Apply filter rules to refine the table view</p>
                <Content
                    {columns}
                    on:apply={(e) => (applied = e.detail.applied)}
                    on:clear={() => (applied = 0)} />
                <hr />
                <div class="u-flex u-margin-block-start-16 u-main-end u-gap-8">
                    <Button text on:click={queries.clearAll}>Clear all</Button>
                    <Button on:click={queries.apply} disabled={!$queriesAreDirty}>Apply</Button>
                </div>
            </div>
        </svelte:fragment>
    </Drop>
</div>

<div class="is-only-mobile">
    <Button secondary on:click={() => (showFiltersMobile = !showFiltersMobile)}>
        <i class="icon-filter u-opacity-50" />
        Filters
        {#if applied > 0}
            <span class="inline-tag">
                {applied}
            </span>
        {/if}
    </Button>

    <Modal
        title="Filters"
        description="Apply filter rules to refine the table view"
        bind:show={showFiltersMobile}
        size="big">
        <Content
            {columns}
            on:apply={(e) => (applied = e.detail.applied)}
            on:clear={() => (applied = 0)} />
        <svelte:fragment slot="footer">
            <Button text on:click={queries.clearAll}>Clear all</Button>
            <Button on:click={queries.apply} disabled={!$queriesAreDirty}>Apply</Button
            ></svelte:fragment>
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
