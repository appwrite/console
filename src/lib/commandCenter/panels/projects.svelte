<script lang="ts">
    import { useSearcher } from '../commands';
    import { projectsSearcher } from '../searchers';
    import Template from './template.svelte';

    const { search, results } = useSearcher(projectsSearcher);
</script>

<Template options={$results} bind:search={$search}>
    <div slot="option" let:option>{option.label}</div>
</Template>
