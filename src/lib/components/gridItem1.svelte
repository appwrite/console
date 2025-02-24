<script>
    import { Heading } from '$lib/components';
    import { Card } from '@appwrite.io/pink-svelte';
    export let href;
</script>

<Card.Link class="card" {href}>
    <div class="grid-item-1">
        <div class="grid-item-1-start-start">
            <div class="eyebrow-heading-3"><slot name="eyebrow" /></div>
            <Heading tag="h2" size="7"><slot name="title" /></Heading>
            <div class="u-padding-block-start-4"><slot name="subtitle" /></div>
        </div>

        <div class="grid-item-1-start-end">
            <slot name="status" />
        </div>

        <div class="grid-item-1-end-start">
            <div class="u-flex u-gap-16 u-flex-wrap">
                <slot />
            </div>
        </div>
        <div class="grid-item-1-end-end">
            <ul class="icons u-flex u-gap-8">
                <slot name="icons" />
            </ul>
        </div>
    </div>
</Card.Link>

<style>
    /* TODO: remove this when ui library is updated*/
    .grid-item-1 {
        min-block-size: calc(182 / 16 * 1rem);
    }
</style>
