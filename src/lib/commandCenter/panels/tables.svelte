<script lang="ts">
    import { initSearcher } from '../commands';
    import { tablesSearcher } from '../searchers';
    import Template from './template.svelte';

    const { search, results } = initSearcher(tablesSearcher);
</script>

<Template options={$results} bind:search={$search} />
