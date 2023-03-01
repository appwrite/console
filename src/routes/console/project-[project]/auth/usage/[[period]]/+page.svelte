<script lang="ts">
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;

    $: count = data.usersTotal;
</script>

<Usage
    title="Users"
    path={`/console/project-${$page.params.project}/auth/usage`}
    {count}
    countMetadata={{
        legend: 'Users',
        title: 'Registered users'
    }} />
