<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Typography } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';

    let {
        project,
        sessionAlertPolicy,
        sessionInvalidationPolicy
    }: {
        project: Models.Project;
        sessionAlertPolicy: Models.PolicySessionAlert | undefined;
        sessionInvalidationPolicy: Models.PolicySessionInvalidation | undefined;
    } = $props();

    let authSessionAlerts = $state(false);
    let sessionInvalidation = $state(false);

    onMount(() => {
        authSessionAlerts = sessionAlertPolicy?.enabled ?? false;
        sessionInvalidation = sessionInvalidationPolicy?.enabled ?? false;
    });

    const hasChanges = $derived.by(() => {
        const alertsChanged = authSessionAlerts !== (sessionAlertPolicy?.enabled ?? false);
        const invalidationChanged =
            sessionInvalidation !== (sessionInvalidationPolicy?.enabled ?? false);
        return alertsChanged || invalidationChanged;
    });

    async function updateSessionSecurity() {
        try {
            const projectSdk = sdk.forProject(project.region, project.$id).project;
            await projectSdk.updateSessionAlertPolicy({
                enabled: authSessionAlerts
            });
            await projectSdk.updateSessionInvalidationPolicy({
                enabled: sessionInvalidation
            });

            await invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message: 'Updated session security settings.'
            });
            trackEvent(Submit.AuthSessionAlertsUpdate);
            trackEvent(Submit.AuthInvalidateSession);
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
