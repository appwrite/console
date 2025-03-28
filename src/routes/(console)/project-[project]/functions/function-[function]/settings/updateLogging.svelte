<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime, type Models } from '@appwrite.io/console';
    import { Typography } from '@appwrite.io/pink-svelte';

    export let func: Models.Function;
    let logging = func.logging;

    async function update() {
        try {
            if (!isValueOfStringEnum(Runtime, func.runtime)) {
                throw new Error(`Invalid runtime: ${func.runtime}`);
            }
            await sdk.forProject.functions.update(
                func.$id,
                func.name,
                func.runtime,
                func.execute || undefined,
                func.events || undefined,
                func.schedule || undefined,
                func.timeout || undefined,
                func.enabled || undefined,
                logging,
                func.entrypoint || undefined,
                func.commands || undefined,
                func.scopes || undefined,
                func.installationId || undefined,
                func.providerRepositoryId || undefined,
                func.providerBranch || undefined,
                func.providerSilentMode || undefined,
                func.providerRootDirectory || undefined
            );
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message:
                    func.name +
                    ' execution logs settings have been ' +
                    (logging ? 'enabled' : 'disabled')
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

<Form onSubmit={update}>
    <CardGrid>
        <svelte:fragment slot="title">Logging</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputSwitch label="Logs" id="logging" bind:value={logging} />
            <Typography.Text>
                When disabled, executions will exclude logs and errors, and will be slightly faster.
            </Typography.Text>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={func.logging === logging} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
