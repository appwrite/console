<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputNumber } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { project } from '../../store';

    let maxSessions = $project?.authSessionsLimit;

    async function updateSessionsLimit() {
        try {
            await sdk.forConsole.projects.updateAuthSessionsLimit($project.$id, maxSessions);
            await invalidate(Dependencies.PROJECT);

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
        <svelte:fragment slot="title">Sessions limit</svelte:fragment>
        <Typography.Text>Maximum number of active sessions allowed per user</Typography.Text>

        <svelte:fragment slot="aside">
            <InputNumber
                required
                min={1}
                max={100}
                id="max-session"
                label="Limit"
                bind:value={maxSessions} />
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button disabled={maxSessions === $project?.authSessionsLimit} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
