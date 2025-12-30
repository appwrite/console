<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { project as projectStore } from '../../store';
    import { page } from '$app/state';

    const project = $derived($projectStore ?? page.data?.project);

    let authSessionAlerts = $state(false);
    let sessionInvalidation = $state(false);

    // Initialize state from project
    $effect(() => {
        authSessionAlerts = project?.authSessionAlerts ?? false;
        sessionInvalidation = project?.authInvalidateSessions ?? false;
    });

    const hasChanges = $derived(
        authSessionAlerts !== (project?.authSessionAlerts ?? false) ||
            sessionInvalidation !== (project?.authInvalidateSessions ?? false)
    );

    async function updateSessionSecurity() {
        try {
            // Update session alerts
            await sdk.forConsole.projects.updateSessionAlerts({
                projectId: project.$id,
                alerts: authSessionAlerts
            });

            // Update session invalidation
            await sdk.forConsole.projects.updateSessionInvalidation({
                projectId: project.$id,
                enabled: sessionInvalidation
            });

            await invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message: 'Updated session security settings.'
            });
            trackEvent(Submit.AuthSessionAlertsUpdate);
            trackEvent(Submit.AuthInvalidateSesssion);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthSessionAlertsUpdate);
        }
    }
</script>

<Form onSubmit={updateSessionSecurity}>
    <CardGrid gap="xxl">
        <svelte:fragment slot="title">Session security</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputSwitch
                bind:value={authSessionAlerts}
                id="authSessionAlerts"
                label="Session alerts">
                <svelte:fragment slot="description">
                    <Typography.Text>
                        Enabling this option will send an email to the users when a new session is
                        created.
                    </Typography.Text>
                </svelte:fragment>
            </InputSwitch>

            <InputSwitch
                bind:value={sessionInvalidation}
                id="invalidateSessions"
                label="Invalidate sessions">
                <svelte:fragment slot="description">
                    <Typography.Text>
                        Enabling this option will clear all existing sessions when the user changes
                        their password.
                    </Typography.Text>
                </svelte:fragment>
            </InputSwitch>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!hasChanges} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
