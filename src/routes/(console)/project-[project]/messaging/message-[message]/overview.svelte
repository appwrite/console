<script lang="ts">
    import { CardGrid } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import ProviderType from '../providerType.svelte';
    import MessageStatusPill from '../messageStatusPill.svelte';
    import type { Models } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import FailedModal from '../failedModal.svelte';
    import SendModal from './sendModal.svelte';
    import ScheduleModal from './scheduleModal.svelte';
    import CancelModal from './cancelModal.svelte';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';

    export let message: Models.Message & { data: Record<string, string> };
    export let topics: Models.Topic[];

    let showSend = false;
    let showSchedule = false;
    let showCancel = false;
    let showFailed = false;
    let errors: string[] = [];
</script>

<CardGrid hideFooter={['processing', 'sent'].includes(message.status)}>
    <ProviderType type={message.providerType} size="s" let:text>
        <Typography.Title size="s">{text}</Typography.Title>
    </ProviderType>
    <svelte:fragment slot="aside">
        <div class="u-flex u-main-space-between">
            <div data-private>
                <p class="title">Created: {toLocaleDateTime(message.$createdAt)}</p>
                {#if message.scheduledAt}
                    <p class="title">Scheduled at: {toLocaleDateTime(message.scheduledAt)}</p>
                {/if}
                {#if message.deliveredAt}
                    <p class="title">Sent at: {toLocaleDateTime(message.deliveredAt)}</p>
                {/if}
            </div>
            <div class="u-flex u-flex-vertical u-cross-end">
                <MessageStatusPill status={message.status} />
            </div>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        {#if message.status === 'draft'}
            <div class="u-flex u-gap-16">
                <Button
                    text
                    on:click={() => {
                        showSchedule = true;
                        trackEvent(Click.MessagingScheduleClick);
                    }}>Schedule</Button>
                <Button secondary on:click={() => (showSend = true)}>Send message</Button>
            </div>
        {:else if message.status === 'scheduled'}
            <div class="u-flex u-gap-16">
                <Button text on:click={() => (showCancel = true)}>Cancel scheduling</Button>
                <Button secondary on:click={() => (showSchedule = true)}>Reschedule</Button>
            </div>
        {:else if message.status === 'failed'}
            <Button
                secondary
                on:click={(e) => {
                    e.preventDefault();
                    errors = message.deliveryErrors;
                    showFailed = true;
                }}>View logs</Button>
        {/if}
    </svelte:fragment>
</CardGrid>

<ScheduleModal bind:show={showSchedule} {message} {topics} />

<SendModal bind:show={showSend} {message} {topics} />

<CancelModal bind:show={showCancel} {message} />

<FailedModal bind:show={showFailed} {errors} />
