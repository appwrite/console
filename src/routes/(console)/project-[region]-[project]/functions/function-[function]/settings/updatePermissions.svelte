<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { func } from '../store';
    import { Roles } from '$lib/components/permissions';
    import { symmetricDifference } from '$lib/helpers/array';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime } from '@appwrite.io/console';
    import { Link } from '$lib/elements';

    const functionId = page.params.function;

    let arePermsDisabled = true;
    let permissions: string[] = [];

    onMount(async () => {
        permissions = $func.execute;
    });

    async function updatePermissions() {
        try {
            if (!isValueOfStringEnum(Runtime, $func.runtime)) {
                throw new Error(`Invalid runtime: ${$func.runtime}`);
            }
            await sdk.forProject(page.params.region, page.params.project).functions.update({
                functionId,
                name: $func.name,
                runtime: $func.runtime,
                execute: permissions,
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
                message: 'Permissions have been updated',
                type: 'success'
            });
            trackEvent(Submit.FunctionUpdatePermissions);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FunctionUpdatePermissions);
        }
    }

    $: if (permissions) {
        if (symmetricDifference(permissions, $func.execute).length) {
            arePermsDisabled = false;
        } else arePermsDisabled = true;
    }
</script>

<Form onSubmit={updatePermissions}>
    <CardGrid>
        <svelte:fragment slot="title">Execute access</svelte:fragment>
        Select who can execute this function using the client API.
        <Link href="https://appwrite.io/docs/advanced/platform/permissions" external>
            Learn more</Link
        >.
        <svelte:fragment slot="aside">
            <Roles bind:roles={permissions} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={arePermsDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
