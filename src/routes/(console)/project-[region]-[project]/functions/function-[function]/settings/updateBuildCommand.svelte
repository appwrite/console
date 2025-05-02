<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime, type Models } from '@appwrite.io/console';

    export let func: Models.Function;
    let buildCommand = func.commands;

    async function updateLogging() {
        try {
            if (!isValueOfStringEnum(Runtime, func.runtime)) {
                throw new Error(`Invalid runtime: ${func.runtime}`);
            }
            await sdk
                .forProject(page.params.region, page.params.project)
                .functions.update(
                    func.$id,
                    func.name,
                    func.runtime,
                    func.execute || undefined,
                    func.events || undefined,
                    func.schedule || undefined,
                    func.timeout || undefined,
                    func.enabled || undefined,
                    func.logging || undefined,
                    func.entrypoint || undefined,
                    buildCommand || undefined,
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
                message: 'Build command has been updated'
            });
            trackEvent(Submit.FunctionUpdateBuildCommand);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionUpdateBuildCommand);
        }
    }
</script>

<Form onSubmit={updateLogging}>
    <CardGrid>
        <svelte:fragment slot="title">Build command</svelte:fragment>
        Define the command used to build your function before deployment.
        <svelte:fragment slot="aside">
            <InputText
                label="Build command"
                id="buildCommand"
                placeholder="npm install"
                bind:value={buildCommand} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={func.commands === buildCommand} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
