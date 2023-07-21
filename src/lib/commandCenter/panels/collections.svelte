<script lang="ts">
    import { useSearcher } from '../commands';
    import { collectionsSearcher } from '../searchers';
    import Template from './template.svelte';

    const { search, results } = useSearcher(collectionsSearcher);
</script>

<Template options={$results} bind:search={$search}>
    <div slot="option" let:option>{option.label}</div>
</Template>
