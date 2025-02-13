<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputNumber, InputSwitch } from '$lib/elements/forms';
    import FormList from '$lib/elements/forms/formList.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
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

    let maxSessionInputField: InputNumber | null = null;

    $: if (passwordHistoryEnabled && maxSessionInputField) {
        tick().then(() => {
            maxSessionInputField.addInputFocus();
        });
    }
</script>

<Form onSubmit={updatePasswordHistoryLimit}>
    <CardGrid>
        <Heading tag="h2" size="7" id="password-history">Password history</Heading>
        <svelte:fragment slot="aside">
            <FormList>
                <InputSwitch
                    bind:value={passwordHistoryEnabled}
                    id="passwordHistoryEnabled"
                    label="Password history" />
            </FormList>
            <p class="text">
                Enabling this option prevents users from reusing recent passwords by comparing the
                new password with their password history.
            </p>
            <p class="text">
                Set the maximum number of passwords saved per user. Maximum 20 passwords.
            </p>
            <FormList>
                <InputNumber
                    max={20}
                    min={1}
                    id="max-session"
                    label="Limit"
                    bind:this={maxSessionInputField}
                    disabled={!passwordHistoryEnabled}
                    bind:value={passwordHistory} />
            </FormList>
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
