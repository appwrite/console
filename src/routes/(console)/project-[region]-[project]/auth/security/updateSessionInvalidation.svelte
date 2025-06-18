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
            await sdk.forConsole.projects.updateAuthPasswordDictionary(
                $project.$id,
                sessionInvalidation
            );
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Updated session invalidation check.'
            });
            trackEvent(Submit.AuthInvalidateSesssion);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthInvalidateSesssion);
        }
    }
</script>

<Form onSubmit={updateSessionInvalidation}>
    <CardGrid>
        <svelte:fragment slot="title">Invalidate sessions</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputSwitch
                bind:value={sessionInvalidation}
                id="passwordDictionary"
                label="Password dictionary" />
            <Typography.Text>
                Enabling this option will clear all existing sessions when the user changes their password.
            </Typography.Text>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={sessionInvalidation === $project?.authInvalidateSessions} submit>
                Update
            </Button>
        </svelte:fragment>
    </CardGrid>
</Form>
