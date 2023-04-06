<script lang="ts">
    import { page } from '$app/stores';
    import { Activity } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;

    const path = `/console/project-${$page.params.project}/databases/database-${$page.params.database}/collection-${$page.params.collection}/activity`;
</script>

<Activity {path} logs={data.logs} offset={data.offset} />
