<script lang="ts">
    import { Container } from '$lib/layout';
    import Delete from './delete.svelte';
    import EmailPreview from './emailPreview.svelte';
    import Overview from './overview.svelte';
    import { message } from './store';
    import SMSPreview from './smsPreview.svelte';
    import PushPreview from './pushPreview.svelte';
    import { messageParams, operation, providerType, targetsById } from '../wizard/store';
    import { topicsById } from '../store';
    import { wizard } from '$lib/stores/wizard';
    import Wizard from '../wizard.svelte';
    import type { PageData } from './$types';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { MessageStatus, MessagingProviderType } from '@appwrite.io/console';
    import UpdateTopics from './updateTopics.svelte';
    import Targets from './targets.svelte';
    import { onMount } from 'svelte';

    export let data: PageData;

    onMount(() => {
        if (isValueOfStringEnum(MessagingProviderType, $message.providerType)) {
            $providerType = $message.providerType;
        }
    });

    async function onEdit() {
        if (!isValueOfStringEnum(MessagingProviderType, $message.providerType)) {
            throw new Error(`Invalid provider type: ${$message.providerType}`);
        }
        $operation = 'update';
        $providerType = $message.providerType;
        $topicsById = {};
        $targetsById = {};

        $topicsById = data.topicsById;
        $targetsById = data.targetsById;

        $messageParams[$providerType] = {
            messageId: $message.$id,
            topics: $message.topics,
            users: $message.users,
            targets: $message.targets,
            status: MessageStatus.Draft,
            scheduledAt: $message.scheduledAt
        };

        switch ($providerType) {
            case MessagingProviderType.Email:
                {
                    const { data } = $message;
                    const params = ['subject', 'content', 'html'];
                    params.forEach((key) => {
                        if (typeof data[key] !== 'undefined') {
                            $messageParams[$providerType][key] = data[key];
                        }
                    });
                }
                break;
            case MessagingProviderType.Sms:
                {
                    const { data } = $message;
                    const params = ['content'];
                    params.forEach((key) => {
                        if (typeof data[key] !== 'undefined') {
                            $messageParams[$providerType][key] = data[key];
                        }
                    });
                }
                break;
            case MessagingProviderType.Push:
                {
                    const { data } = $message;
                    const params = [
                        'title',
                        'body',
                        'action',
                        'icon',
                        'sound',
                        'color',
                        'tag',
                        'badge'
                    ];
                    params.forEach((key) => {
                        if (typeof data[key] !== 'undefined') {
                            $messageParams[$providerType][key] = data[key];
                        }
                    });
                    const dataEntries: [string, string][] = [];
                    Object.entries(data['data'] ?? {}).forEach(([key, value]) => {
                        dataEntries.push([key, value.toString()]);
                    });
                    $messageParams[$providerType]['data'] = dataEntries.length
                        ? dataEntries
                        : [['', '']];
                }
                break;
        }

        wizard.start(Wizard);
    }
</script>

<Container>
    <Overview />
    {#if $message.providerType === MessagingProviderType.Email}
        <EmailPreview
            message={$message}
            onEdit={$message.status === MessageStatus.Draft ? onEdit : null} />
    {:else if $message.providerType === MessagingProviderType.Sms}
        <SMSPreview
            message={$message}
            onEdit={$message.status === MessageStatus.Draft ? onEdit : null} />
    {:else if $message.providerType === MessagingProviderType.Push}
        <PushPreview
            message={$message}
            onEdit={$message.status === MessageStatus.Draft ? onEdit : null} />
    {/if}
    <UpdateTopics
        messageId={$message.$id}
        messageType={$providerType}
        selectedTopicsById={data.topicsById} />
    <Targets targets={Object.values(data.targetsById)} usersById={data.usersById} />
    {#if $message.status !== MessageStatus.Processing}
        <Delete message={$message} />
    {/if}
</Container>
