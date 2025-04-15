<script lang="ts">
    import { Wizard } from '$lib/layout';
    import { onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { wizard } from '$lib/stores/wizard';
    import { createWebhook } from './wizard/store';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import Step1 from './wizard/step1.svelte';
    import Step2 from './wizard/step2.svelte';
    import Step3 from './wizard/step3.svelte';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    const projectId = $page.params.project;
    async function create() {
        try {
            await sdk.forConsole.projects.createWebhook(
                projectId,
                $createWebhook.name,
                $createWebhook.events,
                $createWebhook.url,
                $createWebhook.security,
                true,
                $createWebhook.httpUser || undefined,
                $createWebhook.httpPass || undefined
            );
            await invalidate(Dependencies.WEBHOOKS);
            addNotification({
                message: 'Webhook has been created',
                type: 'success'
            });
            wizard.hide();
            trackEvent(Submit.WebhookCreate, {
                events: $createWebhook.events
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.WebhookCreate);
        }
    }

    onDestroy(() => {
        $createWebhook = {
            name: null,
            url: null,
            events: [],
            security: false,
            httpUser: null,
            httpPass: null
        };
    });

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Configure',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Events',
        component: Step2
    });
    stepsComponents.set(3, {
        label: 'Security',
        component: Step3,
        optional: true
    });
</script>

<Wizard confirmExit title="Create Webhook" steps={stepsComponents} on:finish={create}>
    <svelte:fragment slot="exit">Are you sure you want to exit from this process?</svelte:fragment>
</Wizard>
