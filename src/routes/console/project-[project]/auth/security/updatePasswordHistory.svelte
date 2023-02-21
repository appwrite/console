<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputNumber, InputSelect } from '$lib/elements/forms';
    import { createTimeUnitPair } from '$lib/helpers/unit';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../store';

    const projectId = $project.$id;
    const { value, unit, baseValue, units } = createTimeUnitPair($project.authDuration);
    const options = units.map((v) => ({ label: v.name, value: v.name }));
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
            Maximum nubmer of password history to save for a user. 0 for disabling the password
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
