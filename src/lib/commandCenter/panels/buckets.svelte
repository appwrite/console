<script lang="ts">
    import { initSearcher } from '../commands';
    import { bucketSearcher } from '../searchers';
    import Template from './template.svelte';

    const { search, results } = initSearcher(bucketSearcher);
</script>

<Template options={$results} bind:search={$search} />
