<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Button, FormList, InputDate, InputTime, Helper } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { MessageStatus, MessagingProviderType, type Models } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';

    export let show = false;
    export let messageType: MessagingProviderType;
    export let message: Models.Message & { data: Record<string, unknown> };
    export let topics: Models.Topic[];

    let now = new Date();
    let timeZoneOffset: number;
    let minDate: string;
    // Use Sweden's locale (sv) since it matches ISO format
    let date =
        message.scheduledAt == null ? null : new Date(message.scheduledAt).toLocaleDateString('sv');
    let time =
        message.scheduledAt == null ? null : new Date(message.scheduledAt).toLocaleTimeString('sv');
    let dateTime: Date;
    let totalTargets = message.targets?.length ?? 0;

    const formatOptions: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h23',
        timeZoneName: 'longGeneric'
    };

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
        const status = MessageStatus.Scheduled;
        try {
            if (messageType == MessagingProviderType.Email) {
                await sdk.forProject.messaging.updateEmail(
                    message.$id,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    status,
                    undefined,
                    undefined,
                    undefined,
                    dateTime.toISOString()
                );
            } else if (messageType == MessagingProviderType.Sms) {
                await sdk.forProject.messaging.updateSms(
                    message.$id,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    status,
                    dateTime.toISOString()
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
                    status,
                    dateTime.toISOString()
                );
            }
            await invalidate(Dependencies.MESSAGING_MESSAGE);
            addNotification({
                message: `The message has been scheduled and will be sent to an estimated ${totalTargets} targets.`,
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

    $: timeZoneOffset = now ? now.getTimezoneOffset() * 60 * 1000 : 0;
    $: minDate = new Date(now.getTime() - timeZoneOffset).toISOString().split('T')[0];
    $: minTime =
        date === minDate
            ? new Date(now.getTime() - timeZoneOffset).toISOString().split('T')[1].substring(0, 5)
            : '00:00';
    $: dateTime = new Date(`${date}T${time}`);
</script>

<Modal title="Schedule message" bind:show onSubmit={update} headerDivider={false}>
    <div>
        <FormList>
            <div
                class="u-grid u-gap-16"
                style="grid-auto-rows: 1fr; grid-template-columns: 1fr 1fr;">
                <InputDate id="date" label="Date" required={true} min={minDate} bind:value={date} />
                <InputTime id="time" label="Time" required={true} min={minTime} bind:value={time} />
            </div>
        </FormList>
        <Helper type="neutral">
            {#if !dateTime || isNaN(dateTime.getTime())}
                The message will be sent later
            {:else}
                The message will be sent at {dateTime.toLocaleString('en', formatOptions)}
            {/if}
        </Helper>
    </div>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit>Schedule</Button>
    </svelte:fragment>
</Modal>
