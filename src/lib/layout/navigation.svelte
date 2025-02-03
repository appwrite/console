<script lang="ts">
    import { page } from '$app/stores';
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';

    export let state: 'closed' | 'open' | 'icons' = 'open';
    export let subNavigation;

    $: subNavigation = $page.data.subNavigation;
    // We need to have this second variable, because we only want narrow
    // to change automatically if we change from having a second side nav to
    // not having one, not when the second side nav changes to a different value.
    $: hasSubNavigation = !!subNavigation;

    let narrow = false;
    $: {
        narrow = hasSubNavigation;
    }

    $: getContext<Writable<boolean>>('isNarrow').set(narrow);
    $: getContext<Writable<boolean>>('hasSubNavigation').set(hasSubNavigation);

    function handleKeyDown(event: KeyboardEvent) {
        // If Alt + S is pressed
        if (hasSubNavigation && event.altKey && event.keyCode === 83) {
            event.preventDefault();
            narrow = !narrow;
        }
    }
</script>

<svelte:window on:keydown={handleKeyDown} />

{#if subNavigation}
    <div class="level-2-nav" class:icons={state === 'icons'}>
        <svelte:component this={subNavigation} />
    </div>
{/if}

<style>
    .level-2-nav {
        display: none;

        @media (min-width: 1024px) {
            display: block;
            position: fixed;
            z-index: 10;
            left: 200px;
            transition: left 0.2s ease-in-out;
            margin-left: -5px;
        }
    }

    :global(.level-2-nav nav) {
        padding-left: 15px;
    }

    .icons {
        left: 54px;
    }
</style>
