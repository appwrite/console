<script lang="ts">
    import { Heading } from '$lib/components';
    import { Container } from '$lib/layout';
    import DeleteDomain from './deleteDomain.svelte';
    import DomainDetails from './domainDetails.svelte';

    export let data;

    $: console.log('test');
</script>

<Container>
    <Heading tag="h2" size="5">Settings</Heading>
    <DomainDetails domain={data.domain} />
    <DeleteDomain domain={data.domain} />
</Container>
