<script lang="ts">
    import { initSearcher } from '../commands';
    import { fileSearcher } from '../searchers';
    import Template from './template.svelte';

    const { search, results } = initSearcher(fileSearcher);
</script>

<Template options={$results} bind:search={$search} />
