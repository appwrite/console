<script lang="ts">
    import { Container } from '$lib/layout';
    import DangerZone from './dangerZone.svelte';
    import ExecuteFunction from './executeFunction.svelte';
    import UpdateEvents from './updateEvents.svelte';
    import UpdateLogging from './updateLogging.svelte';
    import UpdateName from './updateName.svelte';
    import UpdatePermissions from './updatePermissions.svelte';
    import UpdateRuntime from './updateRuntime.svelte';
    import UpdateSchedule from './updateSchedule.svelte';
    import UpdateScopes from './updateScopes.svelte';
    import UpdateTimeout from './updateTimeout.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { Alert } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import UpdateRepository from './updateRepository.svelte';
    import UpdateBuildCommand from './updateBuildCommand.svelte';
    import UpdateResourceLimits from './updateResourceLimits.svelte';
    import { isCloud } from '$lib/system';
    import UpdateVariables from '$routes/(console)/project-[project]/updateVariables.svelte';

    export let data;
    let showAlert = true;

    const sdkCreateVariable = async (key: string, value: string, secret?: boolean) => {
        await sdk.forProject.functions.createVariable(data.function.$id, key, value, secret);
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.FUNCTION)]);
    };

    const sdkUpdateVariable = async (
        variableId: string,
        key: string,
        value: string,
        secret?: boolean
    ) => {
        await sdk.forProject.functions.updateVariable(
            data.function.$id,
            variableId,
            key,
            value,
            secret
        );
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.FUNCTION)]);
    };

    const sdkDeleteVariable = async (variableId: string) => {
        await sdk.forProject.functions.deleteVariable(data.function.$id, variableId);
        await Promise.all([invalidate(Dependencies.VARIABLES), invalidate(Dependencies.FUNCTION)]);
    };
</script>

<Container>
    {#if data.function.version === 'v2' && showAlert}
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
                        trackEvent(Click.WebsiteOpenClick, {
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
    <UpdateRuntime runtimesList={data.runtimesList} />
    {#key data.function.providerRepositoryId}
        <UpdateRepository func={data.function} installations={data.installations} />
    {/key}

    <UpdateVariables
        {sdkCreateVariable}
        {sdkUpdateVariable}
        {sdkDeleteVariable}
        isGlobal={false}
        globalVariableList={data.globalVariables}
        variableList={data.variables}
        analyticsSource="function_settings" />
    <UpdateBuildCommand func={data.function} />

    <UpdatePermissions />
    {#if isCloud}
        <UpdateResourceLimits func={data.function} specs={data.specificationsList} />
    {/if}
    <UpdateEvents />
    <UpdateSchedule />
    <UpdateTimeout />
    <UpdateLogging func={data.function} />
    <UpdateScopes />
    <DangerZone />
</Container>
