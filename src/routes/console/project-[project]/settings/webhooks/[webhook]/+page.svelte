<script lang="ts">
    import { Container } from '$lib/layout';
    import DangerZone from './dangerZone.svelte';
    import UpdateEvents from './updateEvents.svelte';
    import UpdateName from './updateName.svelte';
    import UpdateSecurity from './updateSecurity.svelte';
    import UpdateSignature from './updateSignature.svelte';
    import UpdateUrl from './updateURL.svelte';
</script>

<Container>
    <UpdateSignature />
    <UpdateName />
    <UpdateUrl />
    <UpdateEvents />
    <UpdateSecurity />
    <DangerZone />
</Container>
