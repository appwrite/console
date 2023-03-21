<script lang="ts">
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, InputNumber } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';

    const projectId = $project.$id;

    let maxSessions = $project.authSessionsLimit;

    async function updateSessionsLimit() {
        try {
            await sdk.forConsole.projects.updateAuthSessionsLimit(projectId, maxSessions);

            addNotification({
                type: 'success',
                message: 'Sessions limit has been updated'
            });
            trackEvent(Submit.SessionsLimitUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.SessionsLimitUpdate);
        }
    }
</script>

<Form onSubmit={updateSessionsLimit}>
    <CardGrid>
        <Heading tag="h2" size="6">Sessions Limit</Heading>
        <p>Maximum number of active sessions allowed per user.</p>
        <svelte:fragment slot="aside">
            <ul>
                <InputNumber id="max-session" label="Limit" bind:value={maxSessions} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={maxSessions === $project.authSessionsLimit} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
