<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { webhook } from './store';
    import LL from '$i18n/i18n-svelte';

    const projectId = $page.params.project;
    let name: string = null;

    onMount(async () => {
        name ??= $webhook.name;
    });

    async function updateName() {
        try {
            await sdk.forConsole.projects.updateWebhook(
                projectId,
                $webhook.$id,
                name,
                $webhook.events,
                $webhook.url,
                $webhook.security,
                $webhook.httpUser || undefined,
                $webhook.httpPass || undefined
            );
            await invalidate(Dependencies.WEBHOOK);
            addNotification({
                type: 'success',
                message: 'Webhook name has been updated'
            });
            trackEvent(Submit.WebhookUpdateName);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.WebhookUpdateName);
        }
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <Heading tag="h2" size="7">{$LL.console.project.forms.settings.updateName.title()}</Heading>
        <p>{$LL.console.project.forms.settings.updateName.texts.chooseWebhook()}</p>
        <svelte:fragment slot="aside">
            <FormList>
                <InputText
                    id="name"
                    label={$LL.console.project.forms.settings.updateName.inputs.name.label()}
                    placeholder={$LL.console.project.forms.settings.updateName.inputs.name.defaultPlaceholder()}
                    bind:value={name}
                    required />
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={name === $webhook.name || !name} submit
                >{$LL.console.project.button.submit.update()}</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
