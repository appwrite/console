<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';

    export let buttonText: string;
    export let href: string = null;

    const dispatch = createEventDispatcher();
</script>

<div class="top-banner">
    <div class="top-banner-content u-color-text-primary">
        {#if href}
            <a
                class="u-flex u-gap-16 u-main-center u-cross-center u-flex-vertical-mobile"
                {href}
                target="_blank"
                rel="noopener noreferrer">
                <span class="body-text-1 u-bold"><slot /></span>
                <Button secondary fullWidthMobile on:click class="u-line-height-1"
                    >{buttonText}</Button>
            </a>
        {:else}
            <div class="u-flex u-gap-16 u-main-center u-cross-center u-flex-vertical-mobile">
                <span class="body-text-1 u-bold"><slot /></span>
                <Button secondary fullWidthMobile on:click class="u-line-height-1"
                    >{buttonText}</Button>
            </div>
        {/if}
        <button
            on:click|preventDefault={() => dispatch('close')}
            type="button"
            class="top-banner-button"
            aria-label="close upgrade message">
            <span class="icon-x" aria-hidden="true"></span>
        </button>
    </div>
</div>
