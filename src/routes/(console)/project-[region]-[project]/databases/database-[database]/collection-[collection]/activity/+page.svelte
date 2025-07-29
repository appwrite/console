<script lang="ts">
    import { Activity } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;
</script>

<div class="wide-screen-wrapper databases-spreadsheet">
    <Activity {...data} databasesScreen />
</div>
