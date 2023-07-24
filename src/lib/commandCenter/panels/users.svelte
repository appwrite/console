<script lang="ts">
    import { useSearcher } from '../commands';
    import { userSearcher } from '../searchers';
    import Template from './template.svelte';

    const { search, results } = useSearcher(userSearcher);
</script>

<Template options={$results} bind:search={$search} />
