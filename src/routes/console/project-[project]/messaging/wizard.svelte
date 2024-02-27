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
    import { providerType, messageParams, operation } from './wizard/store';
    import { ID, MessagingProviderType, type Models } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';

    async function create() {
        try {
            let response: Models.Message;
            const messageId = $messageParams[$providerType].messageId || ID.unique();

            switch ($providerType) {
                case MessagingProviderType.Email:
                    response = await sdk.forProject.messaging.createEmail(
                        messageId,
                        $messageParams[$providerType].subject,
                        $messageParams[$providerType].content,
                        $messageParams[$providerType].topics,
                        $messageParams[$providerType].users,
                        $messageParams[$providerType].targets,
                        undefined,
                        undefined,
                        undefined,
                        $messageParams[$providerType].draft,
                        $messageParams[$providerType].html,
                        $messageParams[$providerType].scheduledAt
                    );
                    break;
                case MessagingProviderType.Sms:
                    response = await sdk.forProject.messaging.createSms(
                        messageId,
                        $messageParams[$providerType].content,
                        $messageParams[$providerType].topics,
                        $messageParams[$providerType].users,
                        $messageParams[$providerType].targets,
                        $messageParams[$providerType].draft,
                        $messageParams[$providerType].scheduledAt
                    );
                    break;
                case MessagingProviderType.Push:
                    {
                        const customData: Record<string, string> = {};
                        const { data } = $messageParams[MessagingProviderType.Push];
                        if (data && data.length > 0) {
                            data.forEach((item) => {
                                if (item[0] === '') return;
                                customData[item[0]] = item[1];
                            });
                        }

                        response = await sdk.forProject.messaging.createPush(
                            messageId,
                            $messageParams[$providerType].title,
                            $messageParams[$providerType].body,
                            $messageParams[$providerType].topics,
                            $messageParams[$providerType].users,
                            $messageParams[$providerType].targets,
                            customData,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            $messageParams[$providerType].draft,
                            $messageParams[$providerType].scheduledAt
                        );
                    }
                    break;
            }
            wizard.hide();
            let message = '';
            switch (response.status) {
                case 'draft':
                    message = 'The message has been saved as draft.';
                    break;
                case 'processing':
                    message = 'The message is queued for processing.';
                    break;
                case 'scheduled':
                    message = 'The message has been scheduled.';
                    break;
            }
            addNotification({
                type: 'success',
                message
            });
            trackEvent(Submit.MessagingMessageCreate, {
                providerType: $providerType,
                status: response.status
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
            let response: Models.Message;

            const messageId = $messageParams[$providerType].messageId;

            const params = $messageParams[$providerType];

            console.log(params);

            switch ($providerType) {
                case MessagingProviderType.Email:
                    response = await sdk.forProject.messaging.updateEmail(
                        messageId,
                        $messageParams[$providerType].topics,
                        $messageParams[$providerType].users,
                        $messageParams[$providerType].targets,
                        $messageParams[$providerType].subject,
                        $messageParams[$providerType].content,
                        $messageParams[$providerType].draft,
                        $messageParams[$providerType].html,
                        undefined,
                        undefined,
                        $messageParams[$providerType].scheduledAt
                    );
                    break;
                case MessagingProviderType.Sms:
                    response = await sdk.forProject.messaging.updateSms(
                        messageId,
                        $messageParams[$providerType].topics,
                        $messageParams[$providerType].users,
                        $messageParams[$providerType].targets,
                        $messageParams[$providerType].content,
                        $messageParams[$providerType].draft,
                        $messageParams[$providerType].scheduledAt
                    );
                    break;
                case MessagingProviderType.Push:
                    {
                        const customData: Record<string, string> = {};
                        const { data } = $messageParams[MessagingProviderType.Push];
                        if (data && data.length > 0) {
                            data.forEach((item) => {
                                if (item[0] === '') return;
                                customData[item[0]] = item[1];
                            });
                        }

                        response = await sdk.forProject.messaging.updatePush(
                            messageId,
                            $messageParams[$providerType].topics,
                            $messageParams[$providerType].users,
                            $messageParams[$providerType].targets,
                            $messageParams[$providerType].title,
                            $messageParams[$providerType].body,
                            customData,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            $messageParams[$providerType].draft,
                            $messageParams[$providerType].scheduledAt
                        );
                    }
                    break;
            }
            wizard.hide();
            let message = '';
            switch (response.status) {
                case 'draft':
                    message = 'The message has been saved as draft.';
                    break;
                case 'processing':
                    message = 'The message is queued for processing.';
                    break;
                case 'scheduled':
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
                status: response.status
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
        $messageParams[$providerType].draft = true;
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
