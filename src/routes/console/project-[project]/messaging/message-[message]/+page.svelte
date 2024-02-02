<script lang="ts">
    import { Container } from '$lib/layout';
    import Delete from './delete.svelte';
    import EmailPreview from './emailPreview.svelte';
    import Overview from './overview.svelte';
    import { message } from './store';
    import { ProviderTypes } from '../providerType.svelte';
    import SMSPreview from './smsPreview.svelte';
    import PushPreview from './pushPreview.svelte';
    import {
        MessageStatuses,
        messageParams,
        operation,
        providerType,
        targetsById
    } from '../wizard/store';
    import { topicsById } from '../store';
    import { wizard } from '$lib/stores/wizard';
    import Wizard from '../wizard.svelte';
    import type { PageData } from './$types';
    import { isValueOfStringEnum } from '$lib/helpers/types';

    export let data: PageData;

    async function onEdit() {
        if (!isValueOfStringEnum(ProviderTypes, $message.providerType)) {
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
            description: $message.description,
            status: MessageStatuses.DRAFT,
            scheduledAt: $message.scheduledAt
        };

        switch ($providerType) {
            case ProviderTypes.Email:
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
            case ProviderTypes.Sms:
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
            case ProviderTypes.Push:
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
                    $messageParams[$providerType]['data'] = dataEntries || [['', '']];
                }
                break;
        }

        wizard.start(Wizard);
    }
</script>

<Container>
    <Overview />
    {#if $message.providerType === ProviderTypes.Email}
        <EmailPreview
            message={$message}
            onEdit={$message.status === MessageStatuses.DRAFT ? onEdit : null} />
    {:else if $message.providerType === ProviderTypes.Sms}
        <SMSPreview
            message={$message}
            onEdit={$message.status === MessageStatuses.DRAFT ? onEdit : null} />
    {:else if $message.providerType === ProviderTypes.Push}
        <PushPreview
            message={$message}
            onEdit={$message.status === MessageStatuses.DRAFT ? onEdit : null} />
    {/if}
    <Delete />
</Container>
