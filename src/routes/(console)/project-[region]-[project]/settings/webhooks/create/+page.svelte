<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import Modal from '$lib/components/modal.svelte';
    import { Secret } from '$lib/components';
    import { Wizard } from '$lib/layout';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import Form from '$lib/elements/forms/form.svelte';
    import { goto } from '$app/navigation';
    import { ID } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import Step1 from './step1.svelte';
    import Step2 from './step2.svelte';
    import Step3 from './step3.svelte';
    import Button from '$lib/elements/forms/button.svelte';

    let showExitModal = false;
    let showSecretModal = false;
    let createdWebhookId = '';
    let createdSecret = '';

    let name = '',
        events: string[] = [],
        url = '',
        tls = true,
        authUsername = '',
        authPassword = '';

    export let data;

    async function openWebhook() {
        showSecretModal = false;
        if (!createdWebhookId) return;

        await goto(
            `${base}/project-${page.params.region}-${page.params.project}/settings/webhooks/${createdWebhookId}`
        );
    }

    async function create() {
        try {
            const webhook = await sdk
                .forProject(page.params.region, data.project.$id)
                .webhooks.create({
                    webhookId: ID.unique(),
                    name,
                    events,
                    url,
                    tls,
                    enabled: true,
                    authUsername: authUsername || undefined,
                    authPassword: authPassword || undefined
                });
            addNotification({
                message: 'Webhook has been created',
                type: 'success'
            });
            trackEvent(Submit.WebhookCreate, {
                events: events
            });

            createdWebhookId = webhook.$id;
            createdSecret = webhook.secret;

            if (createdSecret) {
                showSecretModal = true;
                return;
            }

            await openWebhook();
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.WebhookCreate);
        }
    }
</script>

<Form onSubmit={create}>
    <Wizard
        title="Create webhook"
        href={`${base}/project-${page.params.region}-${page.params.project}/settings/webhooks`}
        bind:showExitModal
        column
        confirmExit>
        <Layout.Stack gap="xxl">
            <Step1 bind:name bind:url />
            <Step2 bind:events />
            <Step3 bind:authUsername bind:authPassword bind:tls />
        </Layout.Stack>

        <svelte:fragment slot="footer">
            <Button submit>Create webhook</Button>
        </svelte:fragment>
    </Wizard>
</Form>

<Modal title="Webhook Created" bind:show={showSecretModal} onSubmit={openWebhook}>
    <Layout.Stack gap="l">
        <Typography.Text>
            Copy this signing secret now. For security reasons, you will not be able to view it
            again after closing this dialog.
        </Typography.Text>
        <Secret label="Secret" copyEvent="signature" bind:value={createdSecret} />
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Button submit>Continue</Button>
    </svelte:fragment>
</Modal>
