<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { Layout } from '@appwrite.io/pink-svelte';
    import Form from '$lib/elements/forms/form.svelte';
    import { goto } from '$app/navigation';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import Step1 from './step1.svelte';
    import Step2 from './step2.svelte';
    import Step3 from './step3.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    let showExitModal = false;

    let name = '',
        events: string[] = [],
        url = '',
        security = true,
        httpUser = '',
        httpPass = '';

    export let data;
    async function create() {
        try {
            const webhook = await sdk.forConsole.projects.createWebhook(
                data.project.$id,
                name,
                events,
                url,
                security,
                true,
                httpUser || undefined,
                httpPass || undefined
            );
            addNotification({
                message: 'Webhook has been created',
                type: 'success'
            });
            trackEvent(Submit.WebhookCreate, {
                events: events
            });
            goto(getProjectRoute(`/settings/webhooks/${webhook.$id}`));
        } catch (error) {
            trackError(error.message, Submit.DomainCreate);
            throw new Error(error.message);
        }
    }
</script>

<Form onSubmit={create}>
    <Wizard
        title="Create webhook"
        href={getProjectRoute('/settings/webhooks')}
        bind:showExitModal
        column
        confirmExit>
        <Layout.Stack gap="xxl">
            <Step1 bind:name bind:url />
            <Step2 bind:events />
            <Step3 bind:httpUser bind:httpPass bind:security />
        </Layout.Stack>

        <svelte:fragment slot="footer">
            <Button submit>Create webhook</Button>
        </svelte:fragment>
    </Wizard>
</Form>
