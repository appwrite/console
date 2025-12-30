<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { key } from './store';
    import KeyDetails from '../../../overview/(components)/keyDetails.svelte';

    const basePath = `${base}/project-${page.params.region}-${page.params.project}`;
</script>

<KeyDetails key={$key} {basePath} />
