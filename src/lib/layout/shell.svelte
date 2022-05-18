<script lang="ts">
    import { navigating, page } from '$app/stores';
    import { tabs, title } from '$lib/stores/layout';
    import { blur } from 'svelte/transition';
    import { Cover } from '.';

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
        <Cover>
            <svelte:fragment slot="title">{$title}</svelte:fragment>
            <div class="tabs">
                <button class="tabs-button-scroll is-start" aria-label="Show items in start side">
                    <span class="icon-cheveron-left" aria-hidden="true" />
                </button>
                <button class="tabs-button-scroll is-end" aria-label="Show items in end side">
                    <span class="icon-cheveron-right" aria-hidden="true" />
                </button>
                <ul class="tabs-list scroll-shadow-horizontal">
                    {#each $tabs as tab}
                        <li class="tabs-item">
                            <a
                                class="tabs-button"
                                href={`/console/${$page.params.project}/${tab.href}`}
                                class:is-selected={$page.url.pathname ===
                                    `/console/${$page.params.project}/${tab.href}`}>
                                <span class="text">{tab.title}</span>
                            </a>
                        </li>
                    {/each}
                </ul>
            </div>
        </Cover>
        {#key $page.routeId}
            <div in:blur>
                <slot />
            </div>
        {/key}
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
