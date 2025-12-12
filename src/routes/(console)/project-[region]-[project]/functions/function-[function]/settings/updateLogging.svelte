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
    import { isCloud } from '$lib/system';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { page } from '$app/state';

    export let func: Models.Function;
    let logging = func.logging;

    async function update() {
        try {
            if (!isValueOfStringEnum(Runtime, func.runtime)) {
                throw new Error(`Invalid runtime: ${func.runtime}`);
            }
            await sdk.forProject(page.params.region, page.params.project).functions.update({
                functionId: func.$id,
                name: func.name,
                runtime: func.runtime,
                execute: func.execute || undefined,
                events: func.events || undefined,
                schedule: func.schedule || undefined,
                timeout: func.timeout || undefined,
                enabled: func.enabled || undefined,
                logging,
                entrypoint: func.entrypoint || undefined,
                commands: func.commands || undefined,
                scopes: func.scopes || undefined,
                installationId: func.installationId || undefined,
                providerRepositoryId: func.providerRepositoryId || undefined,
                providerBranch: func.providerBranch || undefined,
                providerSilentMode: func.providerSilentMode || undefined,
                providerRootDirectory: func.providerRootDirectory || undefined,
                specification: isCloud ? func.specification || undefined : undefined
            });
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
