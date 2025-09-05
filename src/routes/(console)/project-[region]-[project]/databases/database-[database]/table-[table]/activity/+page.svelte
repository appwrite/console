<script lang="ts">
    import { Activity } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;
</script>

<div class="databases-spreadsheet">
    <Activity {...data} databasesMainScreen />
</div>
