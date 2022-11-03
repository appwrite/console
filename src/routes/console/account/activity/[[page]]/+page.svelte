<script lang="ts">
    import { Activity } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;
    const path = '/console/account/activity';
</script>

<Activity {path} logs={data.logs} offset={data.offset} />
