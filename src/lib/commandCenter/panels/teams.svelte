<script lang="ts">
    import { initSearcher } from '../commands';
    import { teamSearcher } from '../searchers';
    import Template from './template.svelte';

    const { search, results } = initSearcher(teamSearcher);
</script>

<Template options={$results} bind:search={$search} />
