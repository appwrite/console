<script lang="ts">
    import { Container } from '$lib/layout';
    import { collection } from '../store';
    import DangerZone from './dangerZone.svelte';
    import DisplayName from './displayName.svelte';
    import UpdateName from './updateName.svelte';
    import UpdatePermissions from './updatePermissions.svelte';
    import UpdateSecurity from './updateSecurity.svelte';
    import UpdateStatus from './updateStatus.svelte';
</script>

<Container>
    {#if $collection}
        <UpdateStatus />
        <UpdateName />
        <DisplayName />
        <UpdatePermissions />
        <UpdateSecurity />
        <DangerZone />
    {/if}
</Container>
