<script lang="ts">
    import { Container } from '$lib/layout';

    import UpdateEvents from './updateEvents.svelte';
    import ExecuteFunction from './executeFunction.svelte';
    import UpdateName from './updateName.svelte';
    import UpdatePermissions from './updatePermissions.svelte';
    import UpdateSchedule from './updateSchedule.svelte';
    import UpdateTimeout from './updateTimeout.svelte';
    import DangerZone from './dangerZone.svelte';
    import UpdateVariables from '../../../updateVariables.svelte';
    import { func } from '../store';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import UpdateLogging from './updateLogging.svelte';
    import UpdateConfiguration from './updateConfiguration.svelte';

    export let data;

    const sdkCreateVariable = async (key: string, value: string) => {
        await sdk.forProject.functions.createVariable($func.$id, key, value);
        await invalidate(Dependencies.VARIABLES);
    };

    const sdkUpdateVariable = async (variableId: string, key: string, value: string) => {
        await sdk.forProject.functions.updateVariable($func.$id, variableId, key, value);
        await invalidate(Dependencies.VARIABLES);
    };

    const sdkDeleteVariable = async (variableId: string) => {
        await sdk.forProject.functions.deleteVariable($func.$id, variableId);
        await invalidate(Dependencies.VARIABLES);
    };
</script>

<Container>
    <ExecuteFunction />
    <UpdateName />
    <UpdateConfiguration repository={data.repository} installations={data.installations} />
    <UpdateLogging />
    <UpdatePermissions />
    <UpdateEvents />
    <UpdateSchedule />
    <UpdateVariables
        {sdkCreateVariable}
        {sdkUpdateVariable}
        {sdkDeleteVariable}
        isGlobal={false}
        redeployMessage={`${$func.name} has been redeployed.`}
        globalVariableList={data.globalVariables}
        variableList={data.variables} />
    <UpdateTimeout />
    <DangerZone />
</Container>
