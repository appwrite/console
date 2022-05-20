<script lang="ts">
    import { navigating, page } from '$app/stores';
    import { tabs, title } from '$lib/stores/layout';
    import { fade } from 'svelte/transition';
    import { Cover } from '.';

    export let isOpen = false;

    $: base = `/console/${$page.params.project}`;
    let tabsList: HTMLUListElement;
    let showLeft = false;
    let showRight = false;

    navigating.subscribe(() => {
        if (isOpen) isOpen = false;
    });

    const slide = (direction: string) => {
        let scrollCompleted = 0;
        let slideVar = setInterval(function () {
            if (direction == 'left') {
                tabsList.scrollLeft -= 10;
            } else {
                tabsList.scrollLeft += 10;
            }
            scrollCompleted += 10;
            if (scrollCompleted >= 100) {
                clearInterval(slideVar);
            }
        }, 10);
    };

    const onScroll = () => {
        const { offsetWidth, scrollLeft, scrollWidth } = tabsList;
        showLeft = scrollLeft > 10;
        showRight = scrollLeft < scrollWidth - offsetWidth - 10;
    };

    //TODO: implement thisdirectly into onScroll
    const throttle = (fn: () => void, delay: number) => {
        let timeout = false;
        return (...rest: any) => {
            if (!timeout) {
                timeout = true;
                fn.apply(this, rest);
                setTimeout(() => {
                    timeout = false;
                }, delay);
            }
        };
    };
</script>

<svelte:window on:resize={throttle(onScroll, 25)} />

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
            {#if $tabs.length}
                <div class="tabs">
                    {#if showLeft}
                        <button
                            class="tabs-button-scroll is-start"
                            aria-label="Show items in start side"
                            on:click={() => slide('left')}>
                            <span class="icon-cheveron-left" aria-hidden="true" />
                        </button>
                    {/if}
                    {#if showRight}
                        <button
                            class="tabs-button-scroll is-end"
                            aria-label="Show items in end side"
                            on:click={() => slide('right')}>
                            <span class="icon-cheveron-right" aria-hidden="true" />
                        </button>
                    {/if}
                    <ul
                        class="tabs-list scroll-shadow-horizontal"
                        bind:this={tabsList}
                        on:scroll={throttle(onScroll, 25)}>
                        {#each $tabs as tab}
                            <li class="tabs-item">
                                <a
                                    class="tabs-button"
                                    href={`${base}/${tab.href}`}
                                    class:is-selected={$page.url.pathname ===
                                        `${base}/${tab.href}`}>
                                    <span class="text">{tab.title}</span>
                                </a>
                            </li>
                        {/each}
                    </ul>
                </div>
            {/if}
        </Cover>
        {#key $page.routeId}
            <div in:fade>
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
