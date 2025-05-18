<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputNumber, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { project } from '../../store';
    import { tick } from 'svelte';

    let passwordHistory = $project?.authPasswordHistory < 1 ? 5 : $project?.authPasswordHistory;
    let passwordHistoryEnabled = ($project?.authPasswordHistory ?? 0) !== 0;
    let initialPasswordHistoryEnabled = passwordHistoryEnabled;

    async function updatePasswordHistoryLimit() {
        try {
            await sdk.forConsole.projects.updateAuthPasswordHistory(
                $project.$id,
                passwordHistoryEnabled ? passwordHistory : 0
            );
            await invalidate(Dependencies.PROJECT);
            initialPasswordHistoryEnabled = passwordHistoryEnabled;
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

    let maxPasswordInputField: InputNumber | null = null;

    $: if (passwordHistoryEnabled && maxPasswordInputField) {
        tick().then(() => {
            maxPasswordInputField.addInputFocus();
        });
    }
</script>

<Form onSubmit={updatePasswordHistoryLimit}>
    <CardGrid>
        <svelte:fragment slot="title">Password history</svelte:fragment>
        Set the maximum number of passwords saved per user.
        <svelte:fragment slot="aside">
            <InputSwitch
                bind:value={passwordHistoryEnabled}
                id="passwordHistoryEnabled"
                label="Password history" />
            <Typography.Text>
                Enabling this option prevents users from reusing recent passwords by comparing the
                new password with their password history.
            </Typography.Text>
            <InputNumber
                required
                max={20}
                min={1}
                id="password-history"
                label="Limit"
                disabled={!passwordHistoryEnabled}
                bind:value={passwordHistory}
                helper="Maximum 20 passwords." />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={(passwordHistory === $project?.authPasswordHistory ||
                    $project?.authPasswordHistory === 0) &&
                    initialPasswordHistoryEnabled === passwordHistoryEnabled}
                submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
