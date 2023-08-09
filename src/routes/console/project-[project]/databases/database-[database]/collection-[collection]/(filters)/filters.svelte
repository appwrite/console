<script lang="ts">
    import { Drop, Modal } from '$lib/components';
    import Content from './content.svelte';
    import { Button } from '$lib/elements/forms';
    import { queries, tags } from './store';

    // We need to separate them so we don't trigger Drop's handlers
    let showFiltersDesktop = false;
    let showFiltersMobile = false;

    let applied = $tags.length;

    function apply() {
        queries.apply();
        applied = $tags.length;
    }

    function clearAll() {
        queries.clearAll();
        queries.apply();
        applied = 0;
    }
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
                    on:apply={(e) => (applied = e.detail.applied)}
                    on:clear={() => (applied = 0)} />
                <hr />
                <div class="u-flex u-margin-block-start-16 u-main-end u-gap-8">
                    <Button text on:click={clearAll}>Clear all</Button>
                    <Button on:click={apply}>Apply</Button>
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

    <Modal bind:show={showFiltersMobile} size="big">
        <svelte:fragment slot="title">Filters</svelte:fragment>
        <Content on:apply={(e) => (applied = e.detail.applied)} on:clear={() => (applied = 0)} />
        <svelte:fragment slot="footer">
            <Button text on:click={clearAll}>Clear all</Button>
            <Button on:click={apply}>Apply</Button></svelte:fragment>
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
