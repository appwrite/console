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
    import { MessageStatus, MessagingProviderType } from '@appwrite.io/console';
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
    <Overview messageType={$providerType} topics={Object.values(data.topicsById)} />
    {#if $message.providerType === MessagingProviderType.Email}
        <EmailMessage message={$message} />
    {:else if $message.providerType === MessagingProviderType.Sms}
        <SMSMessage message={$message} />
    {:else if $message.providerType === MessagingProviderType.Push}
        <PushMessage message={$message} />
    {/if}
    <UpdateTopics
        messageId={$message.$id}
        messageType={$providerType}
        selectedTopicsById={data.topicsById} />
    <UpdateTargets
        messageId={$message.$id}
        messageType={$providerType}
        selectedTargetsById={data.targetsById} />
    {#if $message.status !== MessageStatus.Processing}
        <Delete message={$message} />
    {/if}
</Container>
