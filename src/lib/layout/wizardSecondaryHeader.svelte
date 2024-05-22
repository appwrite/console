<script lang="ts">
    import { Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    export let href: string;
</script>

<header class="wizard-secondary-header">
    <div class="u-flex u-main-space-between u-gap-32 u-cross-center">
        <Heading size={5} tag="h1"><slot /></Heading>
        <Button text round class="u-margin-block-start-8" ariaLabel="close modal" {href}>
            <span class="icon-x u-font-size-20" aria-hidden="true"></span>
        </Button>
    </div>
    {#if $$slots.description}
        <p class="body-text-2"><slot name="description" /></p>
    {/if}
</header>
