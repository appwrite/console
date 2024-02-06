<script lang="ts">
    import { Wizard } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Step1 from './wizard/step1.svelte';
    import Step2 from './wizard/step2.svelte';
    import Step3 from './wizard/step3.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { project } from '../store';
    import { wizard } from '$lib/stores/wizard';
    import {
        providerType,
        messageParams,
        MessageStatuses,
        type PushMessageParams,
        type SMSMessageParams,
        type EmailMessageParams,
        operation
    } from './wizard/store';
    import { ProviderTypes } from './providerType.svelte';
    import { ID } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';

    async function create() {
        try {
            let response = { $id: '' };
            const messageId = $messageParams[$providerType].messageId || ID.unique();

            const params = $messageParams[$providerType];

            console.log(params);

            const payload:
                | Partial<SMSMessageParams>
                | Partial<EmailMessageParams>
                | Partial<PushMessageParams> = {
                topics: params.topics || [],
                users: params.users || [],
                targets: params.targets || []
            };
            Object.keys(params).forEach((key) => {
                if (['messageId', 'topics', 'users', 'targets'].includes(key)) return;
                if (typeof params[key] === 'undefined') return;
                payload[key] = params[key];
            });

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
                            ...payload,
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
                            ...payload,
                            messageId
                        }
                    );
                    break;
                case ProviderTypes.Push:
                    {
                        const customData: Record<string, string> = {};
                        const { data } = $messageParams[ProviderTypes.Push];
                        if (data && data.length > 0) {
                            data.forEach((item) => {
                                if (item[0] === '') return;
                                customData[item[0]] = item[1];
                            });
                        }

                        response = await sdk.forProject.client.call(
                            'POST',
                            new URL(
                                sdk.forProject.client.config.endpoint + '/messaging/messages/push'
                            ),
                            {
                                'X-Appwrite-Project': sdk.forProject.client.config.project,
                                'content-type': 'application/json',
                                'X-Appwrite-Mode': 'admin'
                            },
                            {
                                ...payload,
                                data: customData,
                                messageId
                            }
                        );
                    }
                    break;
            }
            wizard.hide();
            let message = '';
            switch (params.status) {
                case MessageStatuses.DRAFT:
                    message = 'The message has been saved as draft.';
                    break;
                case MessageStatuses.PROCESSING:
                    message = 'The message is queued for processing.';
                    break;
                case MessageStatuses.SCHEDULED:
                    message = 'The message has been scheduled.';
                    break;
            }
            addNotification({
                type: 'success',
                message
            });
            trackEvent(Submit.MessagingMessageCreate, {
                providerType: $providerType,
                status: params.status
            });
            await goto(`${base}/console/project-${$project.$id}/messaging/message-${response.$id}`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingMessageCreate);
        }
    }

    async function update() {
        try {
            let response = { $id: '' };
            const messageId = $messageParams[$providerType].messageId;

            const params = $messageParams[$providerType];

            console.log(params);

            const payload:
                | Partial<SMSMessageParams>
                | Partial<EmailMessageParams>
                | Partial<PushMessageParams> = {
                topics: params.topics || [],
                users: params.users || [],
                targets: params.targets || []
            };
            Object.keys(params).forEach((key) => {
                if (['messageId', 'topics', 'users', 'targets'].includes(key)) return;
                if (typeof params[key] === 'undefined') return;
                payload[key] = params[key];
            });

            console.log(payload);

            switch ($providerType) {
                case ProviderTypes.Email:
                    response = await sdk.forProject.client.call(
                        'PATCH',
                        new URL(
                            `${sdk.forProject.client.config.endpoint}/messaging/messages/email/${messageId}`
                        ),
                        {
                            'X-Appwrite-Project': sdk.forProject.client.config.project,
                            'content-type': 'application/json',
                            'X-Appwrite-Mode': 'admin'
                        },
                        {
                            ...payload,
                            messageId
                        }
                    );
                    break;
                case ProviderTypes.Sms:
                    response = await sdk.forProject.client.call(
                        'PATCH',
                        new URL(
                            `${sdk.forProject.client.config.endpoint}/messaging/messages/sms/${messageId}`
                        ),
                        {
                            'X-Appwrite-Project': sdk.forProject.client.config.project,
                            'content-type': 'application/json',
                            'X-Appwrite-Mode': 'admin'
                        },
                        {
                            ...payload,
                            messageId
                        }
                    );
                    break;
                case ProviderTypes.Push:
                    {
                        const customData: Record<string, string> = {};
                        const { data } = $messageParams[ProviderTypes.Push];
                        if (data && data.length > 0) {
                            data.forEach((item) => {
                                if (item[0] === '') return;
                                customData[item[0]] = item[1];
                            });
                        }

                        response = await sdk.forProject.client.call(
                            'PATCH',
                            new URL(
                                `${sdk.forProject.client.config.endpoint}/messaging/messages/push/${messageId}`
                            ),
                            {
                                'X-Appwrite-Project': sdk.forProject.client.config.project,
                                'content-type': 'application/json',
                                'X-Appwrite-Mode': 'admin'
                            },
                            {
                                ...payload,
                                data: customData,
                                messageId
                            }
                        );
                    }
                    break;
            }
            wizard.hide();
            let message = '';
            switch (params.status) {
                case MessageStatuses.DRAFT:
                    message = 'The message has been saved as draft.';
                    break;
                case MessageStatuses.PROCESSING:
                    message = 'The message is queued for processing.';
                    break;
                case MessageStatuses.SCHEDULED:
                    message = 'The message has been scheduled.';
                    break;
            }
            addNotification({
                type: 'success',
                message
            });
            await invalidate(Dependencies.MESSAGING_MESSAGE);
            trackEvent(Submit.MessagingMessageUpdate, {
                providerType: $providerType,
                status: params.status
            });
            await goto(`${base}/console/project-${$project.$id}/messaging/message-${response.$id}`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingMessageUpdate);
        }
    }

    async function saveDraft() {
        $messageParams[$providerType].status = MessageStatuses.DRAFT;
        if ($operation === 'create') {
            create();
        } else {
            update();
        }
    }

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Message',
        component: Step1,
        actions: [
            {
                label: 'Save as draft',
                onClick: saveDraft
            }
        ]
    });
    stepsComponents.set(2, {
        label: 'Targets',
        component: Step2,
        actions: [
            {
                label: 'Save as draft',
                onClick: saveDraft
            }
        ]
    });
    stepsComponents.set(3, {
        label: 'Schedule',
        component: Step3,
        actions: [
            {
                label: 'Save as draft',
                onClick: saveDraft
            }
        ]
    });
</script>

<Wizard
    title={$operation === 'create' ? 'Create message' : 'Update message'}
    steps={stepsComponents}
    on:finish={$operation === 'create' ? create : update}
    finalAction="Send" />
