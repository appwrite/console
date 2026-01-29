<script lang="ts">
    import { Container } from '$lib/layout';
    import DeleteDomain from './deleteDomain.svelte';
    import ChangeOrganization from './changeOrganization.svelte';

    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<Container>
    <ChangeOrganization domain={data.domain} organizations={data.organizations} />

    <DeleteDomain domain={data.domain} />
</Container>
