<script lang="ts">
    import { page } from '$app/state';
    import { getContext } from 'svelte';
    import type { Writable } from 'svelte/store';

    export let subNavigation;

    $: subNavigation = page.data.subNavigation;
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
