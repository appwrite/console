<script lang="ts">
    import type { PageData } from './$types';
    import { Activity } from '$lib/layout';

    export let data: PageData;
</script>

<Activity logs={data.logs} offset={data.offset} service="logs" />
