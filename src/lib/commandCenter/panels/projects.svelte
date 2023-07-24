<script lang="ts">
    import { initSearcher } from '../commands';
    import { projectsSearcher } from '../searchers';
    import Template from './template.svelte';

    const { search, results } = initSearcher(projectsSearcher);
</script>

<Template options={$results} bind:search={$search}>
    <div slot="option" let:option>{option.label}</div>
</Template>
