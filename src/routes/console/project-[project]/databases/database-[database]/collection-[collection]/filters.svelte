<script lang="ts">
    import { Drop } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    let showFilters = false;
</script>

<Drop bind:show={showFilters} noArrow>
    <Button secondary on:click={() => (showFilters = !showFilters)}>
        <i class="icon-filter" />
        Filters
    </Button>
    <div class="dropped" slot="list">
        <p>Apply filter rules to refine the table view</p>
        <div class="selects u-flex u-gap-12 u-margin-block-start-16">
            <InputSelect id="column" options={[]} placeholder="Select column" value={undefined} />
            <InputSelect
                id="operator"
                options={[]}
                placeholder="Select operator"
                value={undefined} />
        </div>
        <Button text disabled class="u-margin-block-start-12">
            <i class="icon-plus" />
            Add filter
        </Button>
        <hr />
        <div class="u-flex u-margin-block-start-16 u-main-end u-gap-8">
            <Button text>Clear all</Button>
            <Button>Apply</Button>
        </div>
    </div>
</Drop>

<style lang="scss">
    .icon-filter {
        color: hsl(var(--color-neutral-50));
    }

    .dropped {
        border-radius: 0.5rem;
        border: 1px solid hsl(var(--color-neutral-10));
        background-color: hsl(var(--color-neutral-0));
        box-shadow: 0px 16px 32px 0px rgba(55, 59, 77, 0.04);

        padding: 1rem;
        margin-top: 0.5rem;

        width: 37.5rem;
    }

    .selects {
        :global(> *) {
            flex: 1;
        }
    }

    hr {
        height: 1px;
        width: calc(100% + 2rem);
        background-color: hsl(var(--color-neutral-10));

        margin-block-start: 1rem;
        margin-inline: -1rem;
    }
</style>
