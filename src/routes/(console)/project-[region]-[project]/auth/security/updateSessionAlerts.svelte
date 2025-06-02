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

    let authSessionAlerts = $project?.authSessionAlerts ?? false;

    async function updateSessionAlerts() {
        try {
            await sdk.forConsole.projects.updateSessionAlerts($project.$id, authSessionAlerts);
            await invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Updated session alerts.'
            });
            trackEvent(Submit.AuthSessionAlertsUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthSessionAlertsUpdate);
        }
    }
</script>

<Form onSubmit={updateSessionAlerts}>
    <CardGrid>
        <svelte:fragment slot="title">Session alerts</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputSwitch
                bind:value={authSessionAlerts}
                id="authSessionAlerts"
                label="Session alerts" />
            <Typography.Text>
                Enabling this option will send an email to the users when a new session is created.
            </Typography.Text>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button disabled={authSessionAlerts === $project?.authSessionAlerts} submit>
                Update
            </Button>
        </svelte:fragment>
    </CardGrid>
</Form>
