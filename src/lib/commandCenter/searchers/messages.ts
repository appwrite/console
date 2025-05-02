import { goto } from '$app/navigation';
import { type Searcher } from '../commands';
import { sdk } from '$lib/stores/sdk';
import { MessagingProviderType, type Models } from '@appwrite.io/console';
import { base } from '$app/paths';
import { IconAnnotation, IconDeviceMobile, IconMail } from '@appwrite.io/pink-icons-svelte';
import { page } from '$app/state';

const getLabel = (message: Models.Message) => {
    switch (message.providerType) {
        case MessagingProviderType.Push:
            return message.data['title'];
        case MessagingProviderType.Sms:
            return message.data['content'];
        case MessagingProviderType.Email:
            return message.data['subject'];
        default:
            return 'null';
    }
};

const getIcon = (message: Models.Message) => {
    switch (message.providerType) {
        case MessagingProviderType.Push:
            return IconDeviceMobile;
        case MessagingProviderType.Sms:
            return IconAnnotation;
        case MessagingProviderType.Email:
            return IconMail;
        default:
            throw new Error('Unsupported provider type');
    }
};

export const messagesSearcher = (async (query: string) => {
    const { messages } = await sdk
        .forProject(page.params.region, page.params.project)
        .messaging.listMessages([], query || undefined);

    return messages
        .filter((message) => getLabel(message).toLowerCase().includes(query.toLowerCase()))
        .map(
            (message) =>
                ({
                    group: 'messages',
                    label: getLabel(message),
                    callback: () => {
                        goto(
                            `${base}/project-${page.params.region}-${page.params.project}/messaging/message-${message.$id}`
                        );
                    },
                    icon: getIcon(message)
                }) as const
        );
}) satisfies Searcher;
