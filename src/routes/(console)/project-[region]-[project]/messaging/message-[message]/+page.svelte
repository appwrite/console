<script lang="ts">
    import { Container } from '$lib/layout';
    import Delete from './delete.svelte';
    import EmailMessage from './emailMessage.svelte';
    import Overview from './overview.svelte';
    import { message } from './store';
    import SMSMessage from './smsMessage.svelte';
    import PushMessage from './pushMessage.svelte';
    import { providerType } from '../wizard/store';
    import type { PageData } from './$types';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { MessagingProviderType } from '@appwrite.io/console';
    import UpdateTopics from './updateTopics.svelte';
    import UpdateTargets from './updateTargets.svelte';
    import { onMount } from 'svelte';

    export let data: PageData;

    onMount(() => {
        if (isValueOfStringEnum(MessagingProviderType, $message.providerType)) {
            $providerType = $message.providerType;
        }
    });
</script>

<Container>
    <Overview message={$message} topics={Object.values(data.topicsById)} />
    {#if $message.providerType === MessagingProviderType.Email}
        <EmailMessage message={$message} />
    {:else if $message.providerType === MessagingProviderType.Sms}
        <SMSMessage message={$message} />
    {:else if $message.providerType === MessagingProviderType.Push}
        <PushMessage message={$message} />
    {/if}
    <UpdateTopics message={$message} selectedTopicsById={data.topicsById} />
    <UpdateTargets
        message={$message}
        selectedTargetsById={data.targetsById}
        selectedRecipients={data.messageRecipients} />
    {#if $message.status !== 'processing'}
        <Delete message={$message} />
    {/if}
</Container>
