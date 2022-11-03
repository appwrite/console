<script lang="ts">
    import type { PageData } from './$types';
    import { page } from '$app/stores';
    import { Activity } from '$lib/layout';

    export let data: PageData;
    const path = `/console/project-${$page.params.project}/authentication/databases/database-${$page.params.team}/collection-${$page.params.collection}/document-${$page.params.document}/activity`;
</script>

<Activity {path} logs={data.logs} offset={data.offset} />
