<script lang="ts">
    import { Container } from '$lib/layout';
    import ChangeOrganization from './changeOrganization.svelte';
    import DeleteDomain from './deleteDomain.svelte';

    export let data;
</script>

<Container>
    <ChangeOrganization domain={data.domain} organizations={data.organizations} />
    <DeleteDomain domain={data.domain} />
</Container>
