<script lang="ts">
    import { navigating } from '$app/stores';

    export let isOpen = false;

    navigating.subscribe(() => {
        if (isOpen) isOpen = false;
    });
</script>

<main class="grid-with-side" class:is-open={isOpen}>
    <header class="main-header">
        <button
            class="icon-button is-no-desktop"
            aria-label="Open Menu"
            on:click={() => (isOpen = !isOpen)}>
            <span class={isOpen ? 'icon-x' : 'icon-menu'} aria-hidden="true" />
        </button>
        <slot name="header" />
    </header>
    <nav class="main-side">
        <slot name="side" />
    </nav>
    <section class="main-content">
        <slot />
    </section>
</main>

<style>
    .grid-with-side {
        min-height: 100vh;
    }

    .main-side {
        z-index: 25;
    }
    @media (max-width: 550.99px), (min-width: 551px) and (max-width: 1198.99px) {
        .main-side {
            top: 4.5rem;
        }
    }
</style>
