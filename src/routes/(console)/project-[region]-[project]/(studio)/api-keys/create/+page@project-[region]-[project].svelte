<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import CreateKey from '../../../overview/(components)/create.svelte';

    const basePath = `${base}/project-${page.params.region}-${page.params.project}`;
</script>

<CreateKey {basePath} />
