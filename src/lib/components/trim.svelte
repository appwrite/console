<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import { throttle } from '$lib/helpers/functions';
    import { onMount } from 'svelte';

    export let alternativeTrim = false;
    let showTooltip = false;
    let container: HTMLSpanElement | null;

    onMount(onResize);

    function onResize() {
        showTooltip = container.offsetWidth < container.scrollWidth;
    }
</script>

<svelte:window on:resize={throttle(onResize, 250)} />

<span class={`text ${alternativeTrim ? 'u-trim-1' : 'u-trim'}`} bind:this={container}>
    {#if showTooltip}
        <span
            use:tooltip={{
                content: container.innerText,
                maxWidth: '30rem'
            }}>
            <slot />
        </span>
    {:else}
        <span><slot /></span>
    {/if}
</span>
