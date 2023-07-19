<script lang="ts">
    import { Container } from '$lib/layout';

    import UpdateEvents from './updateEvents.svelte';
    import ExecuteFunction from './executeFunction.svelte';
    import UpdateName from './updateName.svelte';
    import UpdatePermissions from './updatePermissions.svelte';
    import UpdateSchedule from './updateSchedule.svelte';
    import UpdateVariables from './updateVariables.svelte';
    import UpdateTimeout from './updateTimeout.svelte';
    import DangerZone from './dangerZone.svelte';

    export let data;
</script>

<Container>
    <ExecuteFunction />
    <UpdateName />
    <UpdatePermissions />
    <UpdateEvents />
    <UpdateSchedule />
    <UpdateVariables variableList={data.variables} />
    <UpdateTimeout />
    <DangerZone />
</Container>
