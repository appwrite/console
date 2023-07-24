<script lang="ts">
    import { initSearcher } from '../commands';
    import { functionsSearcher } from '../searchers';
    import Template from './template.svelte';

    const { search, results } = initSearcher(functionsSearcher);
</script>

<Template options={$results} bind:search={$search}>
    <div slot="option" let:option>{option.label}</div>
</Template>
