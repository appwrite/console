<script lang="ts">
    import { Activity } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;
</script>

<Activity {...data} />
