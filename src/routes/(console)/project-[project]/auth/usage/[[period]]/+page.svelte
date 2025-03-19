<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Usage } from '$lib/layout';
    import type { PageData } from './$types';

    export let data: PageData;
    $: total = data.usersTotal;
    $: count = data.users;
</script>

<Usage
    path={`${base}/project-${$page.params.project}/auth/usage`}
    countMetadata={{
        legend: 'Users',
        title: 'Registered users'
    }}
    {total}
    {count} />
