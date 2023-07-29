<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import {
        Button,
        Form,
        FormList,
        InputChoice,
        InputPassword,
        InputText
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { webhook } from './store';
    import LL from '$i18n/i18n-svelte';

    const projectId = $page.params.project;
    let httpUser: string = null;
    let httpPass: string = null;
    let security = false;

    onMount(async () => {
        httpUser ??= $webhook.httpUser;
        httpPass ??= $webhook.httpPass;
        security = $webhook.security;
    });

    async function updateSecurity() {
        try {
            await sdk.forConsole.projects.updateWebhook(
                projectId,
                $webhook.$id,
                $webhook.name,
                $webhook.events,
                $webhook.url,
                security,
                httpUser || undefined,
                httpPass || undefined
            );
            await invalidate(Dependencies.WEBHOOK);
            addNotification({
                type: 'success',
                message: 'Webhook security has been updated'
            });
            trackEvent(Submit.WebhookUpdateSecurity);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.WebhookUpdateSecurity);
        }
    }
</script>

<Form onSubmit={updateSecurity}>
    <CardGrid>
        <Heading tag="h2" size="7">{$LL.console.project.title.security.title()}</Heading>
        <p class="text">
            {$LL.console.project.texts.webhooks.httpAuth()}
        </p>
        <svelte:fragment slot="aside">
            <FormList>
                <div>
                    <Heading tag="h3" size="7">{$LL.console.project.title.httpAuth()}</Heading>
                    <p class="text">{$LL.console.project.texts.webhooks.secureEndpoints()}</p>
                </div>

                <InputText
                    id="user"
                    label={$LL.console.project.forms.settings.webhooks.inputs.user.label()}
                    placeholder={$LL.console.project.forms.settings.webhooks.inputs.user.placeholder()}
                    bind:value={httpUser} />

                <InputPassword
                    id="password"
                    minlength={0}
                    showPasswordButton
                    label={$LL.console.project.forms.settings.webhooks.inputs.password.label()}
                    placeholder={$LL.console.project.forms.settings.webhooks.inputs.password.placeholder()}
                    bind:value={httpPass} />

                <InputChoice
                    id="Security"
                    label="Certificate verification (SSL/TLS)"
                    bind:value={security}>
                    <span class="u-color-text-danger">Warning:</span>
                    {$LL.console.project.forms.settings.webhooks.texts.untrustedCertificate()}
                    <a
                        href="https://appwrite.io/docs/custom-domains#enjoySSLCert"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="link">
                        {$LL.console.project.forms.settings.webhooks.texts.learnMoreWarning()}</a>
                </InputChoice>
                
            </FormList>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={httpUser === $webhook.httpUser &&
                    httpPass === $webhook.httpPass &&
                    security === $webhook.security}
                submit>
                {$LL.console.project.button.submit.update()}
            </Button>
        </svelte:fragment>
    </CardGrid>
</Form>
