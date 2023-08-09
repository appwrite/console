<script lang="ts">
    import { initSearcher } from '../commands';
    import { userSearcher } from '../searchers';
    import Template from './template.svelte';

    const { search, results } = initSearcher(userSearcher);
</script>

<Template options={$results} bind:search={$search} />
