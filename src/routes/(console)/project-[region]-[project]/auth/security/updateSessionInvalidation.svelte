<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { project } from '../../store';

    let sessionInvalidation = $project?.authInvalidateSessions ?? false;

    async function updateSessionInvalidation() {
        try {
            await sdk.forConsole.projects.updateSessionInvalidation({
                projectId: $project.$id,
                enabled: sessionInvalidation
            });
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Updated session invalidation check.'
            });
            trackEvent(Submit.AuthInvalidateSession);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthInvalidateSession);
        }
    }
</script>

<Form onSubmit={updateSessionInvalidation}>
    <CardGrid>
        <svelte:fragment slot="title">Invalidate sessions</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputSwitch
                bind:value={sessionInvalidation}
                id="invalidateSessions"
                label="Invalidate sessions" />
            <Typography.Text>
                Enabling this option will clear all existing sessions when the user changes their
                password.
            </Typography.Text>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={sessionInvalidation === $project?.authInvalidateSessions} submit>
                Update
            </Button>
        </svelte:fragment>
    </CardGrid>
</Form>
