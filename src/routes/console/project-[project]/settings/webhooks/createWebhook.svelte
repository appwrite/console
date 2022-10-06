<script lang="ts">
    import { Wizard } from '$lib/layout';
    import Step1 from './wizard/step1.svelte';
    import Step2 from './wizard/step2.svelte';
    import Step3 from './wizard/step3.svelte';
    import { onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { wizard } from '$lib/stores/wizard';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import { createWebhook } from './wizard/store';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { page } from '$app/stores';

    const projectId = $page.params.project;
    const create = async () => {
        try {
            await sdkForConsole.projects.createWebhook(
                projectId,
                $createWebhook.name,
                $createWebhook.events,
                $createWebhook.url,
                $createWebhook.security,
                $createWebhook.httpUser,
                $createWebhook.httpPass
            );
            addNotification({
                message: 'Webhook has been created',
                type: 'success'
            });
            wizard.hide();
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    };

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
        label: 'Add your webhook',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Webhook events',
        component: Step2
    });
    stepsComponents.set(3, {
        label: 'Security (optional)',
        component: Step3
    });
</script>

<Wizard title="Create Webhook" steps={stepsComponents} on:finish={create} />
