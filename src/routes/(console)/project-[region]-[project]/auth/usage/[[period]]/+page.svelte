<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Container, Usage } from '$lib/layout';

    export let data;
    $: total = data.usersTotal;
    $: count = data.users;
</script>

<Container>
    <Usage
        path={`${base}/project-${page.params.region}-${page.params.project}/auth/usage`}
        showAggregateTotal={false}
        isCumulative
        countMetadata={{
            legend: 'Registrations',
            title: 'User registrations per day'
        }}
        {total}
        {count} />
</Container>
