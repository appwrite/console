<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSwitch } from '$lib/elements/forms';
    import { FormList } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
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
        <Heading tag="h2" size="7" id="personal-data">Session alerts</Heading>
        <svelte:fragment slot="aside">
            <FormList>
                <InputSwitch
                    bind:value={authSessionAlerts}
                    id="authSessionAlerts"
                    label="Session alerts" />
            </FormList>
            <p class="text">
                Enabling this option will send an email to the users when a new session is created.
            </p>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={authSessionAlerts === $project?.authSessionAlerts} submit>
                Update
            </Button>
        </svelte:fragment>
    </CardGrid>
</Form>
