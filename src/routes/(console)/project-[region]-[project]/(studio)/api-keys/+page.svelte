<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { PageData } from './$types';
    import Table from '../../overview/(components)/table.svelte';

    export let data: PageData;

    const basePath = `${base}/project-${page.params.region}-${page.params.project}`;
</script>

<Table keys={data.keys} {basePath} />
