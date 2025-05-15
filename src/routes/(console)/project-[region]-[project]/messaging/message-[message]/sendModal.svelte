<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { MessagingProviderType, type Models } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';
    import { Dialog, Layout } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';
    import { page } from '$app/state';

    export let show = false;
    export let message: Models.Message & { data: Record<string, unknown> };
    export let topics: Models.Topic[];

    const dispatch = createEventDispatcher();
    $: totalTargets = message.targets?.length ?? 0;

    for (const topic of topics) {
        if (message.providerType == MessagingProviderType.Push) {
            totalTargets = totalTargets + topic.pushTotal;
        } else if (message.providerType == MessagingProviderType.Email) {
            totalTargets = totalTargets + topic.emailTotal;
        } else if (message.providerType == MessagingProviderType.Sms) {
            totalTargets = totalTargets + topic.smsTotal;
        }
    }

    const update = async () => {
        try {
            if (message.providerType == MessagingProviderType.Email) {
                await sdk
                    .forProject(page.params.region, page.params.project)
                    .messaging.updateEmail(
                        message.$id,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        false
                    );
            } else if (message.providerType == MessagingProviderType.Sms) {
                await sdk
                    .forProject(page.params.region, page.params.project)
                    .messaging.updateSms(
                        message.$id,
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        false
                    );
            } else if (message.providerType == MessagingProviderType.Push) {
                await sdk
                    .forProject(page.params.region, page.params.project)
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
                        false
                    );
            }
            await invalidate(Dependencies.MESSAGING_MESSAGE);
            addNotification({
                message: `The message has been sent to an estimated ${totalTargets} targets.`,
                type: 'success'
            });
            trackEvent(Submit.MessagingMessageUpdate, {
                providerType: message.providerType,
                status
            });
            show = false;
        } catch (error) {
            show = false;
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.MessagingMessageUpdate);
        } finally {
            dispatch('update');
        }
    };
</script>

<Dialog title="Send message" bind:open={show}>
    <div class="u-flex-vertical u-gap-16">
        <p data-private>
            You are about to send a message to an estimated <span class="u-bold"
                >{totalTargets}</span> targets. Would you like to proceed?
        </p>

        <p class="u-bold">This action is irreversible.</p>
    </div>
    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
            <Button text on:click={() => (show = false)}>Cancel</Button>
            <Button on:click={update}>Send</Button>
        </Layout.Stack>
    </svelte:fragment>
</Dialog>
