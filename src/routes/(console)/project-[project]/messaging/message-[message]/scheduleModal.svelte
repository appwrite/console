<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Modal } from '$lib/components';
    import { Button, InputDate, InputTime, Helper } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { MessagingProviderType, type Models } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';
    import { isSameDay, toLocaleDateISO, toLocaleTimeISO } from '$lib/helpers/date';

    export let show = false;
    export let message: Models.Message & { data: Record<string, unknown> };
    export let topics: Models.Topic[];

    let now = new Date();
    let minDate: string;
    // Use Sweden's locale (sv) since it matches ISO format
    let date = message.scheduledAt == null ? null : toLocaleDateISO(message.scheduledAt);
    let time = message.scheduledAt == null ? null : toLocaleTimeISO(message.scheduledAt);
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
                await sdk.forProject.messaging.updateEmail(
                    message.$id,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    false,
                    undefined,
                    undefined,
                    undefined,
                    dateTime.toISOString()
                );
            } else if (message.providerType == MessagingProviderType.Sms) {
                await sdk.forProject.messaging.updateSms(
                    message.$id,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    false,
                    dateTime.toISOString()
                );
            } else if (message.providerType == MessagingProviderType.Push) {
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
                    false,
                    dateTime.toISOString()
                );
            }
            await invalidate(Dependencies.MESSAGING_MESSAGE);
            addNotification({
                message: `The message has been scheduled and will be sent to an estimated ${totalTargets} targets.`,
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

    $: minDate = toLocaleDateISO(now.getTime());
    $: minTime = isSameDay(new Date(date), new Date(minDate))
        ? toLocaleTimeISO(now.getTime())
        : '00:00';
    $: dateTime = new Date(`${date}T${time}`);
</script>

<Modal title="Schedule message" bind:show onSubmit={update}>
    <div>
        <div class="u-grid u-gap-16" style="grid-auto-rows: 1fr; grid-template-columns: 1fr 1fr;">
            <InputDate id="date" label="Date" required={true} min={minDate} bind:value={date} />
            <InputTime id="time" label="Time" required={true} min={minTime} bind:value={time} />
        </div>

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
