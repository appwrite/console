<script lang="ts">
    import { Container } from '$lib/layout';
    import { Typography } from '@appwrite.io/pink-svelte';
    import ChangeOrganization from './changeOrganization.svelte';
    import DeleteDomain from './deleteDomain.svelte';

    export let data;
</script>

<Container>
    <Typography.Title>Settings</Typography.Title>
    <ChangeOrganization domain={data.domain} organizations={data.organizations} />
    <DeleteDomain domain={data.domain} />
</Container>
