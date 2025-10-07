<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { func } from '../store';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime } from '@appwrite.io/console';

    const functionId = page.params.function;
    let functionName: string = null;

    onMount(async () => {
        functionName ??= $func.name;
    });

    async function updateName() {
        try {
            if (!isValueOfStringEnum(Runtime, $func.runtime)) {
                throw new Error(`Invalid runtime: ${$func.runtime}`);
            }
            await sdk.forProject(page.params.region, page.params.project).functions.update({
                functionId,
                name: functionName,
                runtime: $func.runtime,
                execute: $func.execute || undefined,
                events: $func.events || undefined,
                schedule: $func.schedule || undefined,
                timeout: $func.timeout || undefined,
                enabled: $func.enabled || undefined,
                logging: $func.logging || undefined,
                entrypoint: $func.entrypoint || undefined,
                commands: $func.commands || undefined,
                scopes: $func.scopes || undefined,
                installationId: $func.installationId || undefined,
                providerRepositoryId: $func.providerRepositoryId || undefined,
                providerBranch: $func.providerBranch || undefined,
                providerSilentMode: $func.providerSilentMode || undefined,
                providerRootDirectory: $func.providerRootDirectory || undefined,
                specification: $func.specification || undefined
            });
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.FunctionUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FunctionUpdateName);
        }
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <svelte:fragment slot="title">Name</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputText
                id="name"
                label="Name"
                placeholder="Enter name"
                required
                bind:value={functionName} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={functionName === $func.name || !functionName} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
