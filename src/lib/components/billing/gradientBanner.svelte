<script lang="ts">
    import { base } from '$app/paths';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();
</script>

<div class="top-banner">
    <div class="top-banner-bg">
        <div class="top-banner-bg-1">
            <img
                src={`${base}/images/top-banner/bg-pink-desktop.svg`}
                width="1283"
                height="1278"
                alt="" />
        </div>
        <div class="top-banner-bg-2">
            <img
                src={`${base}/images/top-banner/bg-mint-desktop.svg`}
                width="1051"
                height="1271"
                alt="" />
        </div>
    </div>
    <div class="top-banner-content u-color-text-primary">
        <slot />
    </div>
    <button
        on:click|preventDefault={() => dispatch('close')}
        type="button"
        class="top-banner-button"
        aria-label="close upgrade message">
        <span class="icon-x" aria-hidden="true"></span>
    </button>
</div>
