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
    import LL from '$i18n/i18n-svelte';

    const projectId = $project.$id;
    let passwordHistory = $project.authPasswordHistory < 1 ? 5 : $project.authPasswordHistory;
    let passwordHistoryEnabled = ($project.authPasswordHistory ?? 0) != 0;
    let initialPasswordHistoryEnabled = passwordHistoryEnabled;

    async function updatePasswordHistoryLimit() {
        try {
            await sdk.forConsole.projects.updateAuthPasswordHistory(
                projectId,
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
</script>

<Form onSubmit={updatePasswordHistoryLimit}>
    <CardGrid>
        <Heading tag="h2" size="7">{$LL.console.project.title.security.passwordHistory()}</Heading>
        <svelte:fragment slot="aside">
            <FormList>
                <InputSwitch
                    bind:value={passwordHistoryEnabled}
                    id="passwordHisotryEnabled"
                    label={$LL.console.project.forms.security.inputs.passwordHistory.label()} />
            </FormList>
            <p class="text">
                {$LL.console.project.texts.security.passwordHistory.phaseOne()}
            </p>
            <p class="text">
                {$LL.console.project.texts.security.passwordHistory.phaseTwo()}
            </p>
            <FormList>
                <InputNumber
                    max={20}
                    min={1}
                    id="max-session"
                    label={$LL.console.project.forms.security.inputs.maxSession.label()}
                    disabled={!passwordHistoryEnabled}
                    bind:value={passwordHistory} />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={(passwordHistory === $project.authPasswordHistory ||
                    $project.authPasswordHistory === 0) &&
                    initialPasswordHistoryEnabled === passwordHistoryEnabled}
                submit>{$LL.console.project.button.submit.update()}</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
