<script lang="ts">
    import { app } from '$lib/stores/app';
    import EmptyLight from '$lib/images/empty-light.svg';
    import EmptyDark from '$lib/images/empty-dark.svg';
</script>

<button on:click class="card is-border-dashed u-grid u-cross-center">
    <div class="u-flex u-flex-vertical u-cross-center">
        {#if $app.themeInUse === 'dark'}
            <img src={EmptyDark} alt="create" aria-hidden="true" />
        {:else}
            <img src={EmptyLight} alt="create" aria-hidden="true" />
        {/if}
        <slot />
    </div>
</button>
