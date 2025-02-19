<script lang="ts">
    import { Heading } from '$lib/components';
    import { Container } from '$lib/layout';
    import ChangeOrganization from './changeOrganization.svelte';
    import DeleteDomain from './deleteDomain.svelte';

    export let data;
</script>

<Container>
    <Heading tag="h2" size="5">Settings</Heading>
    <ChangeOrganization domain={data.domain} organizations={data.organizations} />
    <DeleteDomain domain={data.domain} />
</Container>
