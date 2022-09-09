<script lang="ts">
    import { DropList } from '$lib/components';

    export let show = false;
</script>

<DropList bind:show>
    <button id="button" on:click={() => (show = !show)}>test</button>

    <svelte:fragment slot="list"><li id="list">list</li></svelte:fragment>
    <svelte:fragment slot="other"><span id="other">other</span></svelte:fragment>
</DropList>
