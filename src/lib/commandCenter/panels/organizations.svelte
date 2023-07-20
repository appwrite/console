<script lang="ts">
    import { useSearcher } from '../commands';
    import { orgSearcher } from '../searchers';
    import Template from './template.svelte';

    const { results, search } = useSearcher(orgSearcher);
</script>

<Template options={$results} bind:search={$search}>
    <div class="option" slot="option" let:option>{option.label}</div>
</Template>
