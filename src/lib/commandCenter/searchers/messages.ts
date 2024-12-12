import { goto } from '$app/navigation';
import { project } from '$routes/(console)/project-[region]-[project]/store';
import { get } from 'svelte/store';
import { type Searcher } from '../commands';
import { sdk } from '$lib/stores/sdk';
import { MessagingProviderType } from '@appwrite.io/console';
import { base } from '$app/paths';
import { page } from '$app/stores';

const getLabel = (message) => {
    switch (message.providerType) {
        case MessagingProviderType.Push:
            return message.data.title;
        case MessagingProviderType.Sms:
            return message.data.content;
        case MessagingProviderType.Email:
            return message.data.subject;
        default:
            return 'null';
    }
};

const getIcon = (message) => {
    switch (message.providerType) {
        case MessagingProviderType.Push:
            return 'device-mobile';
        case MessagingProviderType.Sms:
            return 'annotation';
        case MessagingProviderType.Email:
            return 'mail';
        default:
            return 'send';
    }
};

export const messagesSearcher = (async (query: string) => {
    const $page = get(page);
    const projectId = get(project).$id;
    const { messages } = await sdk
        .forProject($page.params.region, $page.params.project)
        .messaging.listMessages([], query || undefined);

    return messages
        .filter((message) => getLabel(message).toLowerCase().includes(query.toLowerCase()))
        .map(
            (message) =>
                ({
                    group: 'messages',
                    label: getLabel(message),
                    callback: () => {
                        goto(`${base}/project-${projectId}/messaging/message-${message.$id}`);
                    },
                    icon: getIcon(message)
                }) as const
        );
}) satisfies Searcher;
