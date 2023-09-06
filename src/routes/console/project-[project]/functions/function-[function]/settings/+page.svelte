<script lang="ts">
    import { Container } from '$lib/layout';

    import UpdateEvents from './updateEvents.svelte';
    import ExecuteFunction from './executeFunction.svelte';
    import UpdateName from './updateName.svelte';
    import UpdateRuntime from './updateRuntime.svelte';
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
    import { Alert, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';

    export let data;
    let showAlert = true;

    const sdkCreateVariable = async (key: string, value: string) => {
        await sdk.forProject.functions.createVariable($func.$id, key, value);
        await invalidate(Dependencies.VARIABLES);
        await invalidate(Dependencies.FUNCTION);
    };

    const sdkUpdateVariable = async (variableId: string, key: string, value: string) => {
        await sdk.forProject.functions.updateVariable($func.$id, variableId, key, value);
        await invalidate(Dependencies.VARIABLES);
        await invalidate(Dependencies.FUNCTION);
    };

    const sdkDeleteVariable = async (variableId: string) => {
        await sdk.forProject.functions.deleteVariable($func.$id, variableId);
        await invalidate(Dependencies.VARIABLES);
        await invalidate(Dependencies.FUNCTION);
    };
</script>

<Container>
    <Heading tag="h2" size="5">Settings</Heading>
    {#if $func.version !== 'v3' && showAlert}
        <Alert
            type="warning"
            dismissible
            class="u-margin-block-start-24"
            on:dismiss={() => (showAlert = false)}>
            <svelte:fragment slot="title">Your function is outdated</svelte:fragment>
            Update your function version to make use of new features including build commands and HTTP
            data in your executions. To update, follow the steps outlined in our
            <a
                href="https://appwrite.io/docs/functions-develop#upgrade"
                target="_blank"
                rel="noopener noreferrer"
                class="link">documentation</a
            >.
            <svelte:fragment slot="buttons">
                <Button href="https://appwrite.io/docs/functions-develop#upgrade" external text>
                    Learn more
                </Button>
            </svelte:fragment>
        </Alert>
    {/if}
    <ExecuteFunction />
    <UpdateName />
    <UpdateRuntime />
    <UpdateConfiguration />
    <UpdateLogging />
    <UpdatePermissions />
    <UpdateEvents />
    <UpdateSchedule />
    <UpdateVariables
        {sdkCreateVariable}
        {sdkUpdateVariable}
        {sdkDeleteVariable}
        isGlobal={false}
        globalVariableList={data.globalVariables}
        variableList={data.variables} />
    <UpdateTimeout />
    <DangerZone />
</Container>
