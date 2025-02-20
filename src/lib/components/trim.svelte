<script lang="ts">
    import { Tooltip } from '@appwrite.io/pink-svelte';

    export let alternativeTrim = false;
    let container: HTMLSpanElement | null;
</script>

<Tooltip maxWidth="auto">
    <span class={`text ${alternativeTrim ? 'u-trim-1' : 'u-trim'}`} bind:this={container}>
        <slot />
    </span>
    <span slot="tooltip">{container?.innerText ?? undefined} </span>
</Tooltip>
