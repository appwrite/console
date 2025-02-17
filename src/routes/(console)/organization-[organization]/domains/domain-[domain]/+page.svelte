<script lang="ts">
    import { Heading } from '$lib/components';
    import { Container } from '$lib/layout';
    import DomainDetails from './domainDetails.svelte';

    export let data;
</script>

<Container>
    <Heading tag="h2" size="5">Settings</Heading>
    <DomainDetails domain={data.domain} />
</Container>
