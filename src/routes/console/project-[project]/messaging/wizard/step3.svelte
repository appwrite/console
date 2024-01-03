<script lang="ts">
    import { FormList, InputDate, InputSelect, InputTime } from '$lib/elements/forms';
    import Helper from '$lib/elements/forms/helper.svelte';
    import { WizardStep } from '$lib/layout';
    import { messageParams, providerType } from './store';

    let when: 'now' | 'later' = 'now';
    let now = new Date();
    let timeZoneOffset: number;
    let minDate: string;
    let date: string;
    let time: string;
    let dateTime: Date;

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
        timeZoneName: 'longOffset'
    };

    async function beforeSubmit() {
        if (when === 'later') {
            $messageParams[$providerType].scheduledAt = dateTime.toISOString();
        }
        console.log($messageParams[$providerType]);
    }

    $: if (when === 'now') {
        date = time = '';
    }
    $: if (when === 'later') {
        now = new Date();
    }
    $: timeZoneOffset = now ? now.getTimezoneOffset() * 60 * 1000 : 0;
    $: minDate = new Date(now.getTime() - timeZoneOffset).toISOString().split('T')[0];
    $: minTime =
        date === minDate
            ? new Date(now.getTime() - timeZoneOffset).toISOString().split('T')[1].substring(0, 5)
            : '00:00';
    $: dateTime = new Date(`${date}T${time}`);
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Schedule</svelte:fragment>
    <!-- TODO: Add link to docs -->
    <svelte:fragment slot="subtitle"
        >Schedule the time you want your users to receive this message. Learn more in our
        documentation.</svelte:fragment>
    <FormList>
        <div
            class="u-grid u-gap-24"
            style="grid-auto-rows: 1fr; grid-template-columns: 1fr 1fr 1fr;">
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
    </FormList>
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

<!-- <Modal
    title="Send message"
    bind:show={showDelete}
    onSubmit={deleteAccount}
    icon="exclamation"
    state="warning"
    headerDivider={false}>
    <p>Are you sure you want to delete your account?</p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button secondary submit>Delete</Button>
    </svelte:fragment>
</Modal> -->
