<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { message } from './store';
    import ProviderType, { ProviderTypes } from '../providerType.svelte';
    import MessageStatusPill from '../messageStatusPill.svelte';

    let scheduledAt: string = '';
    if ($message.status === 'sent') {
        scheduledAt = $message.deliveredAt;
    } else if ($message.status === 'scheduled') {
        scheduledAt = $message.scheduledAt;
    }

    let providerType = 'Invalid provider type';
    switch ($message.providerType) {
        case ProviderTypes.Email:
            providerType = 'Email';
            break;
        case ProviderTypes.Sms:
            providerType = 'SMS';
            break;
        case ProviderTypes.Push:
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
        <!-- TODO: Add support for editing draft messages -->
        <!-- <Button disabled={$message.status !== 'draft'} on:click={() => console.log('click')}
            >Edit message</Button> -->
    </svelte:fragment>
</CardGrid>
