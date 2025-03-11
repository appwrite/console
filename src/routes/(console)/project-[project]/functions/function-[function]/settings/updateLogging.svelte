<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import InputSwitch from '$lib/elements/forms/inputSwitch.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '$routes/(console)/project-[project]/store';
    import { onMount } from 'svelte';
    import { func } from '../store';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime } from '@appwrite.io/console';
    import { base } from '$app/paths';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { Link } from '$lib/elements';

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
            await sdk.forProject.functions.update(
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
                $func.providerRootDirectory || undefined
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
        <svelte:fragment slot="title">Execution logs</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputSwitch label="Logs" id="logging" bind:value={functionLogging} />
            <Typography.Text>
                When disabled, execution logs and errors will not be shown in the <Link
                    href={`${base}/project-${$project.$id}/functions/function-${$func.$id}/executions`}>
                    Executions</Link> tab. We recommend disabling them for better performance in production.
            </Typography.Text>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={$func.logging === functionLogging} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
