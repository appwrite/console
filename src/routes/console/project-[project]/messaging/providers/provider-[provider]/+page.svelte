<script lang="ts">
    import { Container } from '$lib/layout';
    import DangerZone from './dangerZone.svelte';
    import UpdateName from './updateName.svelte';
    import UpdateStatus from './updateStatus.svelte';
</script>

<Container>
    <UpdateStatus />
    <UpdateName />
    <DangerZone />
</Container>
