<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import { throttle } from '$lib/helpers/functions';
    import { onMount } from 'svelte';

    let showTooltip = false;
    export let alternativeTrim = false;
    let container: HTMLSpanElement | null;

    onMount(onResize);

    function onResize() {
        showTooltip = container.offsetWidth < container.scrollWidth;
    }
</script>

<svelte:window on:resize={throttle(onResize, 250)} />

<span
    class={`text ${alternativeTrim ? 'u-trim-1' : 'u-trim'}`}
    bind:this={container}
    use:tooltip={{
        disabled: !showTooltip,
        appendTo: 'parent',
        content: container?.innerText ?? undefined,
        maxWidth: '30rem'
    }}>
    <span><slot /></span>
</span>
