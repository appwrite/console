<script lang="ts">
    import { Container, Usage } from '$lib/layout';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data;
    $: total = data.usersTotal;
    $: count = data.users;
</script>

<Container>
    <Usage
        path={getProjectRoute('/auth/usage')}
        countMetadata={{
            legend: 'Users',
            title: 'Registered users'
        }}
        {total}
        {count} />
</Container>
