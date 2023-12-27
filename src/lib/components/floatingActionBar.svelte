<script lang="ts">
    import { portal } from '$lib/actions/portal';
    import { fly } from 'svelte/transition';

    export let show = false;
</script>

{#if show}
    <div class="floating-action-bar" transition:fly={{ y: '6rem' }} use:portal>
        <slot />
    </div>
{/if}

<style lang="scss">
    .floating-action-bar {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 100;

        border-radius: 0.5rem;
        padding: 0.75rem 1rem;

        width: clamp(0px, calc(100vw - 4rem), 32.5rem);
    }

    :global(.theme-dark) .floating-action-bar {
        border: 1px solid hsl(var(--color-neutral-85));
        background: hsl(var(--color-neutral-90));
        box-shadow: 0px 6px 16px 8px #14141f;
    }

    :global(.theme-light) .floating-action-bar {
        border: 1px solid hsl(var(--color-neutral-15));
        background: hsl(var(--color-neutral-0));
        box-shadow: 0px 6px 16px 0px rgba(55, 59, 77, 0.14);
    }
</style>
