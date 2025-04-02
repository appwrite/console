<script lang="ts">
    import { throttle } from '$lib/helpers/functions';

    let showLeft = false;
    let showRight = false;
    let tabsList: HTMLUListElement;

    function slide(direction: 'left' | 'right') {
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
    }

    function onScroll() {
        if (!tabsList) {
            return;
        }
        const { offsetWidth, scrollLeft, scrollWidth } = tabsList;
        showLeft = scrollLeft > 10;
        showRight = scrollLeft < scrollWidth - offsetWidth - 30;
    }
</script>

<svelte:window on:resize={throttle(onScroll, 25)} />

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
        role="tablist"
        bind:this={tabsList}
        on:scroll={throttle(onScroll, 25)}>
        <slot />
    </ul>
</div>
