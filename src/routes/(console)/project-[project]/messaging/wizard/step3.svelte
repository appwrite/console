<script lang="ts">
    import { Button, FormList, InputDate, InputSelect, InputTime } from '$lib/elements/forms';
    import Helper from '$lib/elements/forms/helper.svelte';
    import { WizardStep } from '$lib/layout';
    import { MessagingProviderType } from '@appwrite.io/console';
    import { messageParams, providerType } from './store';
    import { isSameDay, toLocaleDateISO, toLocaleTimeISO } from '$lib/helpers/date';
    import { wizard } from '$lib/stores/wizard';
    import { Modal } from '$lib/components';
    import { topicsById } from '../store';

    let when: 'now' | 'later' = 'now';
    let now = new Date();
    let minDate: string;
    let date: string;
    let time: string;
    let dateTime: Date;
    let docsUrl = `https://appwrite.io/docs/products/messaging`;
    let showConfirmation = false;

    let totalTargets = $messageParams[$providerType].targets?.length ?? 0;

    const topics = $messageParams[$providerType].topics;

    for (const topic of topics) {
        if ($providerType == MessagingProviderType.Push) {
            totalTargets += $topicsById[topic].pushTotal;
        } else if ($providerType == MessagingProviderType.Email) {
            totalTargets += $topicsById[topic].emailTotal;
        } else if ($providerType == MessagingProviderType.Sms) {
            totalTargets += $topicsById[topic].smsTotal;
        }
    }

    switch ($providerType) {
        case MessagingProviderType.Email:
            docsUrl += '/send-email-messages';
            break;
        case MessagingProviderType.Sms:
            docsUrl += '/send-sms-messages';
            break;
        case MessagingProviderType.Push:
            docsUrl += '/send-push-notifications';
            break;
    }

    const options = [
        { label: 'Now', value: 'now' },
        { label: 'Schedule', value: 'later' }
    ];
    const formatOptions: Intl.DateTimeFormatOptions = {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h23',
        timeZoneName: 'longGeneric'
    };

    async function askForConfirmation() {
        $wizard.interceptorNotificationEnabled = false;
        showConfirmation = true;
        throw 'Show confirmation';
    }

    async function submit() {
        $wizard.interceptorNotificationEnabled = true;
        await $wizard.finalAction();
        showConfirmation = false;
    }

    $: if (when === 'now') {
        date = time = '';
    }
    $: if (when === 'later') {
        now = new Date();
    }
    $: minDate = toLocaleDateISO(now.getTime());
    $: minTime = isSameDay(new Date(date), new Date(minDate))
        ? toLocaleTimeISO(now.getTime())
        : '00:00';
    $: dateTime = new Date(`${date}T${time}`);
    $: if (!isNaN(dateTime.getTime())) {
        $messageParams[$providerType].scheduledAt = dateTime.toISOString();
    }
</script>

<WizardStep beforeSubmit={askForConfirmation}>
    <svelte:fragment slot="title">Schedule</svelte:fragment>
    <svelte:fragment slot="subtitle"
        >Schedule the time you want to deliver this message. Learn more in our <Button
            href={docsUrl}>documentation</Button
        >.</svelte:fragment>

    <div class="u-grid u-gap-24" style="grid-auto-rows: 1fr; grid-template-columns: 1fr 1fr 1fr;">
        <InputSelect id="when" label="&nbsp;" {options} bind:value={when} />
        <InputDate
            id="date"
            label="Date"
            disabled={when === 'now'}
            required={when === 'later'}
            min={minDate}
            bind:value={date} />
        <InputTime
            id="time"
            label="Time"
            disabled={when === 'now'}
            required={when === 'later'}
            min={minTime}
            bind:value={time} />
    </div>

    <Helper type="neutral">
        {#if when === 'now'}
            The message will be sent immediately
        {:else if !dateTime || isNaN(dateTime.getTime())}
            The message will be sent later
        {:else}
            The message will be sent at {dateTime.toLocaleString('en', formatOptions)}
        {/if}
    </Helper>
</WizardStep>

<Modal title="Send message" bind:show={showConfirmation} onSubmit={submit}>
    <p>
        You are about to send a message to an estimated <span class="u-bold">{totalTargets}</span> recipients.
        Would you like to proceed?
    </p>
    <p class="u-bold">This action is irreversible.</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showConfirmation = false)}>Cancel</Button>
        <Button secondary submit>Send</Button>
    </svelte:fragment>
</Modal>
