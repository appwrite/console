<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputNumber } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';
    import LL from '$i18n/i18n-svelte';

    const projectId = $project.$id;

    let maxSessions = $project.authSessionsLimit;

    async function updateSessionsLimit() {
        try {
            await sdk.forConsole.projects.updateAuthSessionsLimit(projectId, maxSessions);
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
        <Heading tag="h2" size="7">{$LL.console.project.title.security.sessionLimit()}</Heading>
        <p>{$LL.console.project.texts.security.sessionLimit()}</p>
        <svelte:fragment slot="aside">
            <ul>
                <InputNumber
                    id="max-session"
                    label={$LL.console.project.forms.security.inputs.maxSession.label()}
                    bind:value={maxSessions} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={maxSessions === $project.authSessionsLimit} submit
                >{$LL.console.project.button.submit.update()}</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
