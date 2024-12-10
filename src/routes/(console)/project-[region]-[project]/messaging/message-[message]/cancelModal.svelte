<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { MessagingProviderType, type Models } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';
    import { page } from '$app/stores';

    export let show = false;
    export let message: Models.Message & { data: Record<string, unknown> };

    const update = async () => {
        try {
            if (message.providerType == MessagingProviderType.Email) {
                await sdk
                    .forProject($page.params.region, $page.params.project)
                    .messaging.updateEmail(
                        message.$id,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        true
                    );
            } else if (message.providerType == MessagingProviderType.Sms) {
                await sdk
                    .forProject($page.params.region, $page.params.project)
                    .messaging.updateSms(
                        message.$id,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        true
                    );
            } else if (message.providerType == MessagingProviderType.Push) {
                await sdk
                    .forProject($page.params.region, $page.params.project)
                    .messaging.updatePush(
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
                        true
                    );
            }
            await invalidate(Dependencies.MESSAGING_MESSAGE);
            addNotification({
                message: `The scheduling has been cancelled.`,
                type: 'success'
            });
            trackEvent(Submit.MessagingMessageUpdate, {
                providerType: message.providerType,
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

<Modal
    title="Cancel scheduling"
    bind:show
    onSubmit={update}
    headerDivider={false}
    size="small"
    icon="exclamation"
    state="warning">
    <div class="u-flex-vertical u-gap-16">
        <p data-private>
            Are you sure you want to cancel the scheduling of <span class="u-bold"
                >{message.data.title ??
                    message.data.subject ??
                    message.data.content ??
                    'Message'}</span
            >?
        </p>
    </div>
    <svelte:fragment slot="footer">
        <Button secondary submit>Cancel scheduling</Button>
    </svelte:fragment>
</Modal>
