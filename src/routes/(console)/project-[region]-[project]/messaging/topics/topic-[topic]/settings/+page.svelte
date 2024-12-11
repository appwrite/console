<script lang="ts">
    import { Container } from '$lib/layout';
    import DangerZone from './dangerZone.svelte';
    import Details from './details.svelte';
    import UpdateName from './updateName.svelte';
    import UpdatePermissions from './updatePermissions.svelte';
</script>

<Container>
    <Details />
    <UpdateName />
    <UpdatePermissions />
    <DangerZone />
</Container>
