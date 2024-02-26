<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { MessageStatus, MessagingProviderType, type Models } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';

    export let show = false;
    export let messageType: MessagingProviderType;
    export let message: Models.Message & { data: Record<string, unknown> };
    export let topics: Models.Topic[];

    let totalTargets = message.targets?.length ?? 0;

    for (const topic of topics) {
        if (messageType == MessagingProviderType.Push) {
            totalTargets = totalTargets + topic.pushTotal;
        } else if (messageType == MessagingProviderType.Email) {
            totalTargets = totalTargets + topic.emailTotal;
        } else if (messageType == MessagingProviderType.Sms) {
            totalTargets = totalTargets + topic.smsTotal;
        }
    }

    const update = async () => {
        const status = MessageStatus.Processing;
        try {
            if (messageType == MessagingProviderType.Email) {
                await sdk.forProject.messaging.updateEmail(
                    message.$id,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    status
                );
            } else if (messageType == MessagingProviderType.Sms) {
                await sdk.forProject.messaging.updateSms(
                    message.$id,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    status
                );
            } else if (messageType == MessagingProviderType.Push) {
                await sdk.forProject.messaging.updatePush(
                    message.$id,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    status
                );
            }
            await invalidate(Dependencies.MESSAGING_MESSAGE);
            addNotification({
                message: `The message has been sent to an estimated ${totalTargets} targets.`,
                type: 'success'
            });
            trackEvent(Submit.MessagingMessageUpdate, {
                providerType: messageType,
                status
            });
            show = false;
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.MessagingMessageUpdate);
        }
    };
</script>

<Modal title="Send message" bind:show onSubmit={update} headerDivider={false}>
    <div class="u-flex-vertical u-gap-16">
        <p data-private>
            You are about to send a message to an estimated <span class="u-bold"
                >{totalTargets}</span> targets. Would you like to proceed?
        </p>

        <p class="u-bold">This action is irreversible.</p>
    </div>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Send</Button>
    </svelte:fragment>
</Modal>
