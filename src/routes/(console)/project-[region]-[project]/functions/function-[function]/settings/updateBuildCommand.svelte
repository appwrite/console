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
    import { page } from '$app/state';

    export let func: Models.Function;
    let buildCommand = func.commands;

    async function updateLogging() {
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
                logging: func.logging || undefined,
                entrypoint: func.entrypoint || undefined,
                commands: buildCommand || undefined,
                scopes: func.scopes || undefined,
                installationId: func.installationId || undefined,
                providerRepositoryId: func.providerRepositoryId || undefined,
                providerBranch: func.providerBranch || undefined,
                providerSilentMode: func.providerSilentMode || undefined,
                providerRootDirectory: func.providerRootDirectory || undefined,
                specification: func.specification || undefined
            });

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
