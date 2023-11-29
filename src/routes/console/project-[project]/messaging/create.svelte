<script lang="ts">
    import { onDestroy } from 'svelte';
    import { Wizard } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Step1 from './wizard/step1.svelte';
    import Step2 from './wizard/step2.svelte';
    import Step3 from './wizard/step3.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { project } from '../store';
    import { wizard } from '$lib/stores/wizard';
    import { providerType, messageParams } from './wizard/store';
    import { ProviderTypes } from './providerType.svelte';
    import { ID } from '@appwrite.io/console';

    async function create() {
        try {
            let response = { $id: '' };
            const messageId = $messageParams[$providerType].messageId || ID.unique();
            switch ($providerType) {
                case ProviderTypes.Email:
                    response = await sdk.forProject.client.call(
                        'POST',
                        new URL(
                            sdk.forProject.client.config.endpoint + '/messaging/messages/email'
                        ),
                        {
                            'X-Appwrite-Project': sdk.forProject.client.config.project,
                            'content-type': 'application/json',
                            'X-Appwrite-Mode': 'admin'
                        },
                        {
                            ...$messageParams[$providerType],
                            messageId
                        }
                    );
                    break;
                case ProviderTypes.Sms:
                    response = await sdk.forProject.client.call(
                        'POST',
                        new URL(sdk.forProject.client.config.endpoint + '/messaging/messages/sms'),
                        {
                            'X-Appwrite-Project': sdk.forProject.client.config.project,
                            'content-type': 'application/json',
                            'X-Appwrite-Mode': 'admin'
                        },
                        {
                            ...$messageParams[$providerType],
                            messageId
                        }
                    );
                    break;
                case ProviderTypes.Push:
                    response = await sdk.forProject.client.call(
                        'POST',
                        new URL(
                            sdk.forProject.client.config.endpoint + '/messaging/providers/telesign'
                        ),
                        {
                            'X-Appwrite-Project': sdk.forProject.client.config.project,
                            'content-type': 'application/json',
                            'X-Appwrite-Mode': 'admin'
                        },
                        {
                            ...$messageParams[$providerType],
                            messageId
                        }
                    );
                    break;
            }
            wizard.hide();
            addNotification({
                type: 'success',
                message: `The message has been sent.`
            });
            trackEvent(Submit.MessagingMessageCreate, {
                providerType: $providerType
            });
            await goto(`${base}/console/project-${$project.$id}/messaging/message-${response.$id}`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingProviderCreate);
        }
    }

    onDestroy(() => {
        console.log('destroy');
    });

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Message',
        component: Step1
    });
    stepsComponents.set(2, {
        label: 'Targets',
        component: Step2
    });
    stepsComponents.set(3, {
        label: 'Schedule',
        component: Step3
    });
</script>

<Wizard title="Create message" steps={stepsComponents} on:finish={create} finalAction="Send" />
