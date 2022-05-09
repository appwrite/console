<script>
    import SwitchBox from './switchBox.svelte';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let boxes;
</script>

<ul class="grid-box">
    {#each boxes as box}
        <SwitchBox {box} on:updated={(e) => dispatch('updated', e.detail)} />
    {/each}
</ul>
