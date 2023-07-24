<script lang="ts">
    import { useSearcher } from '../commands';
    import { teamSearcher } from '../searchers';
    import Template from './template.svelte';

    const { search, results } = useSearcher(teamSearcher);
</script>

<Template options={$results} bind:search={$search} />
