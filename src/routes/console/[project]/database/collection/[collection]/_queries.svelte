<script lang="ts">
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { collection } from './store';

    // svelte-ignore unused-export-let
    export let queries: string[] = [];

    let selectedOption: string;

    $: currentIndex = $collection.indexes.find((i) => i.key === selectedOption);

    const options = $collection.indexes.map((i) => {
        return {
            value: i.key,
            label: i.key
        };
    });
</script>

<InputSelect id="currentIndex" label="Index" {options} bind:value={selectedOption} />

{#if currentIndex}
    {#each currentIndex.attributes as a}
        <p>{a}</p>
    {/each}
{/if}
