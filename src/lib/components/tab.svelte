<script lang="ts">
    import { goto } from '$app/navigation';
    import { trackEvent } from '$lib/actions/analytics';
    import { last } from '$lib/helpers/array';
    import { getElementDir } from '$lib/helpers/style';
    import { waitUntil } from '$lib/helpers/waitUntil';

    export let selected = false;
    export let href: string = null;
    export let event: string = null;
    export let noscroll = false;

    async function handleClick(e: Event) {
        if (event) {
            trackEvent(`click_select_tab_${event}`);
        }

        if (href) {
            let el = e.target as HTMLElement;
            if (el.tagName !== 'A') {
                el = el.closest('a');
            }

            await goto(href);
            await waitUntil(() => {
                return el.classList.contains('is-selected');
            }, 1000);
            el.focus();
        }
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
        const tabsList = tabItem.closest('.tabs') as HTMLElement;
        const tabItems = Array.from(tabsList.querySelectorAll('.tabs-item'));
        const currentIdx = tabItems.indexOf(tabItem);

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
                const lastTabBtn = last(tabItems).querySelector('.tabs-button') as HTMLElement;
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

<li class="tabs-item" role="tab">
    {#if href}
        <a
            class="tabs-button"
            {href}
            data-sveltekit-noscroll={noscroll}
            class:is-selected={selected}
            on:click={handleClick}
            tabindex={selected ? 0 : -1}
            on:keydown={handleKeyDown}>
            <span class="text"><slot /></span>
        </a>
    {:else}
        <button
            type="button"
            class="tabs-button"
            class:is-selected={selected}
            on:click|preventDefault
            on:click={handleClick}
            tabindex={selected ? 0 : -1}
            on:keydown={handleKeyDown}>
            <span class="text"><slot /></span>
        </button>
    {/if}
</li>
