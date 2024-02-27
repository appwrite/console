<script lang="ts">
    import { Container } from '$lib/layout';
    import DangerZone from './dangerZone.svelte';
    import UpdateEvents from './updateEvents.svelte';
    import UpdateName from './updateName.svelte';
    import UpdateSecurity from './updateSecurity.svelte';
    import UpdateSignature from './updateSignature.svelte';
    import UpdateUrl from './updateURL.svelte';
    import Details from './details.svelte';
</script>

<Container>
    <Details />
    <UpdateSignature />
    <UpdateName />
    <UpdateUrl />
    <UpdateEvents />
    <UpdateSecurity />
    <DangerZone />
</Container>
