<script lang="ts">
    import { Container } from '$lib/layout';

    import DangerZone from './dangerZone.svelte';
    import ExecuteFunction from './executeFunction.svelte';
    import UpdateConfiguration from './updateConfiguration.svelte';
    import UpdateEvents from './updateEvents.svelte';
    import UpdateLogging from './updateLogging.svelte';
    import UpdateName from './updateName.svelte';
    import UpdatePermissions from './updatePermissions.svelte';
    import UpdateRuntime from './updateRuntime.svelte';
    import UpdateSchedule from './updateSchedule.svelte';
    import UpdateScopes from './updateScopes.svelte';
    import UpdateTimeout from './updateTimeout.svelte';
    import UpdateVariables from '../../../updateVariables.svelte';

    import { func } from '../store';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { Alert, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { trackEvent } from '$lib/actions/analytics';
    import { page } from '$app/stores';

    export let data;
    let showAlert = true;

    const sdkCreateVariable = async (key: string, value: string) => {
        await sdk
            .forProject($page.params.region, $page.params.project)
            .functions.createVariable($func.$id, key, value);
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.FUNCTION)]);
    };

    const sdkUpdateVariable = async (variableId: string, key: string, value: string) => {
        await sdk
            .forProject($page.params.region, $page.params.project)
            .functions.updateVariable($func.$id, variableId, key, value);
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.FUNCTION)]);
    };

    const sdkDeleteVariable = async (variableId: string) => {
        await sdk
            .forProject($page.params.region, $page.params.project)
            .functions.deleteVariable($func.$id, variableId);
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.FUNCTION)]);
    };
</script>

<Container>
    <Heading tag="h2" size="5">Settings</Heading>
    {#if $func.version === 'v2' && showAlert}
        <Alert
            type="warning"
            dismissible
            class="u-margin-block-start-24"
            on:dismiss={() => (showAlert = false)}>
            <svelte:fragment slot="title">Your function is outdated</svelte:fragment>
            Update your function version to make use of new features including build commands and HTTP
            data in your executions. To update, follow the steps outlined in our
            <a
                href="https://appwrite.io/docs/products/functions/development"
                target="_blank"
                rel="noopener noreferrer"
                class="link">documentation</a
            >.
            <svelte:fragment slot="buttons">
                <Button
                    on:click={() =>
                        trackEvent('click_open_website', {
                            from: 'button',
                            source: 'function_keys_card',
                            destination: 'docs'
                        })}
                    href="https://appwrite.io/docs/products/functions/development"
                    external
                    text>
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
    <UpdateScopes />
    <DangerZone />
</Container>
