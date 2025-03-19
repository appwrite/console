<script lang="ts">
    import { Container } from '$lib/layout';
    import ChangeOrganization from './changeOrganization.svelte';
    import DeleteDomain from './deleteDomain.svelte';
    import type { OrganizationList } from '$lib/stores/organization';

    export let data;
    // cloud only, so OrganizationList is returned!
    let organizations: OrganizationList = data.organizations as OrganizationList;
</script>

<Container>
    <ChangeOrganization domain={data.domain} organizations={organizations} />
    <DeleteDomain domain={data.domain} />
</Container>
