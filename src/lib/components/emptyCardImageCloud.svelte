<script>
    import Card from './card.svelte';

    export let source = 'empty_state_card';
    export let noAspectRatio = false;
</script>

<Card style="--card-padding:1.5rem; --card-padding-mobile: 2rem">
    <div class="u-flex u-gap-24 u-flex-vertical-mobile">
        {#if $$slots?.image}
            <div class="u-stretch">
                <div
                    style:--p-file-preview-border-color="transparent"
                    class="file-preview is-full-cover-image u-width-full-line u-height-100-percent"
                    style={noAspectRatio ? 'aspect-ratio: auto' : ''}>
                    <slot name="image" />
                </div>
            </div>
        {/if}
        <div class="u-stretch u-flex-vertical u-main-center">
            <h3 class="body-text-2 u-bold"><slot name="title" /></h3>
            <p class="u-margin-block-start-8">
                <slot />
            </p>
            <slot name="cta" {source} />
        </div>
    </div>
</Card>
