<script lang="ts">
    import { Activity } from '$lib/layout';
    import type { PageData } from './$types';

    const {
        data
    }: {
        data: PageData;
    } = $props();
</script>

<div class="wide-screen-wrapper databases-spreadsheet">
    <Activity {...data} databasesScreen />
</div>
