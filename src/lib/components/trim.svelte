<script lang="ts">
    import { tooltip } from '$lib/actions/tooltip';
    import { throttle } from '$lib/helpers/functions';
    import { onMount } from 'svelte';
    import { Tooltip } from '@appwrite.io/pink-svelte';

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
    <Tooltip inline={false}
        ><span class="text u-trim"><slot /></span><span slot="tooltip"
            >{container?.innerText ?? undefined}</span
        ></Tooltip>
</span>
