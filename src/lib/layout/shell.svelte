<script lang="ts">
    import { navigating, page } from '$app/stores';
    import { tabs, title, backButton, copyData, titleDropdown } from '$lib/stores/layout';
    import { Cover } from '.';
    import { Copy, DropList, DropListItem } from '$lib/components';
    import { Pill } from '$lib/elements';

    export let isOpen = false;
    export let showSideNavigation = false;

    // $: base = `/console/${$page.params.project}`;

    let tabsList: HTMLUListElement;
    let showLeft = false;
    let showRight = false;
    let showDropdown = false;

    navigating.subscribe(() => {
        if (isOpen) isOpen = false;
    });

    const slide = (direction: 'left' | 'right') => {
        let scrollCompleted = 0;
        let slideVar = setInterval(() => {
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
        if (!tabsList) {
            return;
        }
        const { offsetWidth, scrollLeft, scrollWidth } = tabsList;
        showLeft = scrollLeft > 10;
        showRight = scrollLeft < scrollWidth - offsetWidth - 10;
    };

    //TODO: implement this directly into onScroll
    const throttle = (fn: () => void, delay: number) => {
        let timeout = false;
        return () => {
            if (!timeout) {
                timeout = true;
                fn.apply(this);
                setTimeout(() => {
                    timeout = false;
                }, delay);
            }
        };
    };
</script>

<svelte:window on:resize={throttle(onScroll, 25)} />

<main
    class:grid-with-side={showSideNavigation}
    class:grid={!showSideNavigation}
    class:is-open={isOpen}>
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
            <svelte:fragment slot="header">
                {#if $backButton}
                    <a class="back-button" href={$backButton} aria-label="page back">
                        <span class="icon-cheveron-left" aria-hidden="true" />
                    </a>
                {/if}
                {#if $titleDropdown?.length}
                    <DropList bind:show={showDropdown} position="bottom" arrow={false}>
                        <button
                            class="button is-text u-padding-inline-0"
                            on:click={() => (showDropdown = !showDropdown)}>
                            <h1 class="heading-level-4">
                                <span class="text"> drop</span>

                                <span
                                    class={`icon-cheveron-${showDropdown ? 'up' : 'down'}`}
                                    aria-hidden="true" />
                            </h1>
                        </button>
                        <svelte:fragment slot="list">
                            {#each $titleDropdown as organization}
                                <DropListItem>
                                    {organization.name}
                                </DropListItem>
                            {/each}
                        </svelte:fragment>
                        <svelte:fragment slot="other">
                            <section class="drop-section">
                                <ul class="drop-list">
                                    <DropListItem icon="plus">New Organizations</DropListItem>
                                </ul>
                            </section></svelte:fragment>
                    </DropList>
                {:else}
                    <h1 class="heading-level-4">
                        <span class="text"> {$title}</span>
                    </h1>
                {/if}
                {#if $copyData?.value}
                    <Copy value={$copyData.value}>
                        <Pill button
                            ><span
                                class="icon-duplicate"
                                aria-hidden="true" />{$copyData.text}</Pill>
                    </Copy>
                {/if}
            </svelte:fragment>

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
                                    href={`${tab.href}`}
                                    class:is-selected={$page.url.pathname === `${tab.href}`}>
                                    <span class="text">{tab.title}</span>
                                </a>
                            </li>
                        {/each}
                    </ul>
                </div>
            {/if}
        </Cover>
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
