<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import { getElementDir } from '$lib/helpers/style';

    export let selected = false;
    export let href: string = null;
    export let event: string = null;

    function track() {
        if (!event) return;
        trackEvent(`click_select_tab_${event}`);
    }

    const keysMap = {
        ltr: {
            next: 'ArrowRight',
            prev: 'ArrowLeft'
        },
        rtl: {
            next: 'ArrowLeft',
            prev: 'ArrowRight'
        }
    };

    function handleKeyDown(e: KeyboardEvent) {
        const tabBtn = e.target as HTMLElement;
        const tabItem = tabBtn.closest('.tabs-item') as HTMLElement;
        const tabsList = tabBtn.closest('.tabs-item').closest('.tabs') as HTMLElement;
        const tabItems = tabsList.querySelectorAll('.tabs-item');
        const currentIdx = Array.from(tabItems).indexOf(tabItem);

        const dir = getElementDir(tabsList);

        switch (e.key) {
            case 'Home': {
                e.preventDefault();
                const firstTabBtn = tabItems[0].querySelector('.tabs-button') as HTMLElement;
                firstTabBtn.focus();
                break;
            }
            case 'End': {
                e.preventDefault();
                const lastTabBtn = tabItems[tabItems.length - 1].querySelector(
                    '.tabs-button'
                ) as HTMLElement;
                lastTabBtn.focus();
                break;
            }
            case keysMap[dir].next: {
                e.preventDefault();
                const nextIdx = currentIdx === tabItems.length - 1 ? 0 : currentIdx + 1;
                const nextTabBtn = tabItems[nextIdx].querySelector('.tabs-button') as HTMLElement;
                nextTabBtn.focus();
                break;
            }
            case keysMap[dir].prev: {
                e.preventDefault();
                const prevIdx = currentIdx === 0 ? tabItems.length - 1 : currentIdx - 1;
                const prevTabBtn = tabItems[prevIdx].querySelector('.tabs-button') as HTMLElement;
                prevTabBtn.focus();
                break;
            }
        }
    }
</script>

<li class="tabs-item">
    {#if href}
        <a
            class="tabs-button"
            {href}
            class:is-selected={selected}
            on:click={track}
            tabindex={selected ? 0 : -1}
            on:keydown={handleKeyDown}
            role="tab">
            <span class="text"><slot /></span>
        </a>
    {:else}
        <button
            type="button"
            class="tabs-button"
            class:is-selected={selected}
            on:click|preventDefault
            on:click={track}
            tabindex={selected ? 0 : -1}
            on:keydown={handleKeyDown}
            role="tab">
            <span class="text"><slot /></span>
        </button>
    {/if}
</li>
