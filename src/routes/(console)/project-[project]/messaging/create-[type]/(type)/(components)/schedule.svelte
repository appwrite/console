<script lang="ts">
    import { Button, InputDate, InputSelect, InputTime } from '$lib/elements/forms';
    import Helper from '$lib/elements/forms/helper.svelte';
    import { MessagingProviderType } from '@appwrite.io/console';
    import { isSameDay, toLocaleDateISO, toLocaleTimeISO } from '$lib/helpers/date';
    import { wizard } from '$lib/stores/wizard';
    import { Modal } from '$lib/components';
    import { Layout } from '@appwrite.io/pink-svelte';

    export let type: MessagingProviderType;
    export let topics: string[];
    export let targets: string[];
    export let scheduledAt: string;

    let when: 'now' | 'later' = 'now';
    let now = new Date();
    let minDate: string;
    let date: string;
    let time: string;
    let dateTime: Date;
    let docsUrl = `https://appwrite.io/docs/products/messaging`;
    let showConfirmation = false;

    let totalTargets = targets?.length ?? 0;

    switch (type) {
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
        scheduledAt = dateTime.toISOString();
    }
</script>

<Layout.Stack>
    <InputSelect id="when" required {options} bind:value={when} />
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
    <Helper type="neutral">
        {#if when === 'now'}
            The message will be sent immediately
        {:else if !dateTime || isNaN(dateTime.getTime())}
            The message will be sent later
        {:else}
            The message will be sent at {dateTime.toLocaleString('en', formatOptions)}
        {/if}
    </Helper>
</Layout.Stack>
{#if showConfirmation}
    <Modal title="Send message" bind:show={showConfirmation} onSubmit={submit}>
        <p>
            You are about to send a message to an estimated <span class="u-bold"
                >{totalTargets}</span> recipients. Would you like to proceed?
        </p>
        <p class="u-bold">This action is irreversible.</p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showConfirmation = false)}>Cancel</Button>
            <Button secondary submit>Send</Button>
        </svelte:fragment>
    </Modal>
{/if}
