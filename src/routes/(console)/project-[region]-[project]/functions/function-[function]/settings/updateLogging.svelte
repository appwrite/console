<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList } from '$lib/elements/forms';
    import InputSwitch from '$lib/elements/forms/inputSwitch.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '$routes/(console)/project-[region]-[project]/store';
    import { onMount } from 'svelte';
    import { func } from '../store';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime } from '@appwrite.io/console';
    import { base } from '$app/paths';

    const functionId = $page.params.function;
    let functionLogging: boolean = null;

    onMount(async () => {
        functionLogging ??= $func.logging;
    });

    async function updateLogging() {
        try {
            if (!isValueOfStringEnum(Runtime, $func.runtime)) {
                throw new Error(`Invalid runtime: ${$func.runtime}`);
            }
            await sdk
                .forProject($page.params.region, $page.params.project)
                .functions.update(
                    functionId,
                    $func.name,
                    $func.runtime,
                    $func.execute || undefined,
                    $func.events || undefined,
                    $func.schedule || undefined,
                    $func.timeout || undefined,
                    $func.enabled || undefined,
                    functionLogging,
                    $func.entrypoint || undefined,
                    $func.commands || undefined,
                    $func.scopes || undefined,
                    $func.installationId || undefined,
                    $func.providerRepositoryId || undefined,
                    $func.providerBranch || undefined,
                    $func.providerSilentMode || undefined,
                    $func.providerRootDirectory || undefined,
                    $func.specification || undefined
                );
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message:
                    $func.name +
                    ' execution logs settings have been ' +
                    (functionLogging ? 'enabled' : 'disabled')
            });
            trackEvent(Submit.FunctionUpdateLogging);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionUpdateLogging);
        }
    }
</script>

<Form onSubmit={updateLogging}>
    <CardGrid>
        <Heading tag="h6" size="7">Execution logs</Heading>
        <p>
            Enable or disable execution logs. We recommend disabling them for better performance in
            production.
        </p>
        <svelte:fragment slot="aside">
            <FormList>
                <InputSwitch label="Logs" id="logging" bind:value={functionLogging}>
                    <svelte:fragment slot="description">
                        <p>
                            When disabled, execution logs and errors will not be shown in the <a
                                href={`${base}/project-${$project.region}-${$project.$id}/functions/function-${$func.$id}/executions`}
                                class="link">
                                Executions</a> tab
                        </p>
                    </svelte:fragment>
                </InputSwitch>
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={$func.logging === functionLogging} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
