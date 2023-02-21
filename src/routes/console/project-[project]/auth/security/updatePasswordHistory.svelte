<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputNumber } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../store';

    const projectId = $project.$id;
    let passwordHistory = $project.authPasswordHistory ?? 0;

    async function updatePasswordHistoryLimit() {
        try {
            const path = '/projects/' + projectId + '/auth/password-history';
            const uri = new URL(sdkForConsole.client.config.endpoint + path);
            await sdkForConsole.client.call(
                'patch',
                uri,
                {
                    'content-type': 'application/json'
                },
                {
                    limit: passwordHistory
                }
            );
            invalidate(Dependencies.PROJECT);
            addNotification({
                type: 'success',
                message: 'Updated password history limit.'
            });
            trackEvent(Submit.AuthPasswordHistoryUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AuthPasswordHistoryUpdate);
        }
    }
</script>

<Form on:submit={updatePasswordHistoryLimit}>
    <CardGrid>
        <Heading tag="h2" size="6">Password History</Heading>
        <p>
            Maximum number of passwords saved per user. Use 0 to disable the password
            history.
        </p>
        <svelte:fragment slot="aside">
            <ul>
                <InputNumber id="max-session" label="Limit" bind:value={passwordHistory} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={passwordHistory === $project.passwordHistory} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
