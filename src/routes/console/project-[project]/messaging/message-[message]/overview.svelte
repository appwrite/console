<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { message } from './store';
    import ProviderType from '../providerType.svelte';
    import MessageStatusPill from '../messageStatusPill.svelte';
    import { MessagingProviderType } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import FailedModal from '../failedModal.svelte';

    let scheduledAt: string = '';
    let showFailed = false;
    let errors: string[] = [];

    if ($message.status === 'sent') {
        scheduledAt = $message.deliveredAt;
    } else if ($message.status === 'scheduled') {
        scheduledAt = $message.scheduledAt;
    }

    let providerType = 'Invalid provider type';
    switch ($message.providerType) {
        case MessagingProviderType.Email:
            providerType = 'Email';
            break;
        case MessagingProviderType.Sms:
            providerType = 'SMS';
            break;
        case MessagingProviderType.Push:
            providerType = 'Push';
            break;
    }
</script>

<CardGrid>
    <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16" data-private>
        <ProviderType type={$message.providerType} size="l">
            <Heading tag="h6" size="7">{providerType}</Heading>
        </ProviderType>
    </div>
    <svelte:fragment slot="aside">
        <div class="u-flex u-main-space-between">
            <div data-private>
                <p class="title">Created: {toLocaleDateTime($message.$createdAt)}</p>
                <p class="title">Scheduled at: {toLocaleDateTime(scheduledAt)}</p>
            </div>
            <div class="u-flex u-flex-vertical u-cross-end">
                <MessageStatusPill status={$message.status} />
            </div>
        </div>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        {#if $message.status === 'failed'}
            <Button
                text
                on:click={(e) => {
                    e.preventDefault();
                    errors = $message.deliveryErrors;
                    showFailed = true;
                }}>View logs</Button>
        {/if}
    </svelte:fragment>
</CardGrid>

<FailedModal bind:show={showFailed} {errors} />
