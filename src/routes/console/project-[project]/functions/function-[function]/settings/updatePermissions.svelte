<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { func } from '../store';
    import { Roles } from '$lib/components/permissions';
    import { symmetricDifference } from '$lib/helpers/array';

    const functionId = $page.params.function;

    let arePermsDisabled = true;
    let permissions: string[] = [];

    onMount(async () => {
        permissions = $func.execute;
    });

    async function updatePermissions() {
        try {
            await sdk.forProject.functions.update(
                functionId,
                $func.name,
                permissions,
                $func.events || undefined,
                $func.schedule || undefined,
                $func.timeout || undefined,
                $func.enabled,
                $func.logging
            );
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
        <Heading tag="h6" size="7">Execute Access</Heading>
        <p>
            Choose who can execute this function using the client API. For more information, check
            out the <a
                href="https://appwrite.io/docs/permissions"
                target="_blank"
                rel="noopener noreferrer"
                class="link">
                Permissions Guide
            </a>.
        </p>
        <svelte:fragment slot="aside">
            <Roles bind:roles={permissions} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={arePermsDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
