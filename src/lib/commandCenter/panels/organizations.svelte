<script lang="ts">
    import { initSearcher } from '../commands';
    import { orgSearcher } from '../searchers';
    import Template from './template.svelte';

    const { results, search } = initSearcher(orgSearcher);
</script>

<Template options={$results} bind:search={$search} />
