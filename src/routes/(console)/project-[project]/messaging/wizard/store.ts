import { MessagingProviderType, type Models } from '@appwrite.io/console';
import { get, writable } from 'svelte/store';

export type MessageParams = {
    messageId: string;
    topics: string[];
    users: string[];
    targets: string[];
    draft: boolean;
    scheduledAt?: string;
};

export type EmailMessageParams = MessageParams & {
    subject: string;
    content: string;
    html: boolean;
};

export type SMSMessageParams = MessageParams & {
    content: string;
};

export type PushMessageParams = MessageParams & {
    title: string;
    body: string;
    data: [string, string][];
    file: Models.File;
    action?: string;
    icon?: string;
    sound?: string;
    color?: string;
    tag?: string;
    badge?: string;
};

export const providerType = writable<MessagingProviderType>(null);
export const targetsById = writable<Record<string, Models.Target>>({});
export const messageParams = writable<{
    [MessagingProviderType.Email]: Partial<EmailMessageParams>;
    [MessagingProviderType.Sms]: Partial<SMSMessageParams>;
    [MessagingProviderType.Push]: Partial<PushMessageParams>;
}>({
    [MessagingProviderType.Email]: null,
    [MessagingProviderType.Sms]: null,
    [MessagingProviderType.Push]: null
});

export function getTotal(topic: Models.Topic): number {
    switch (get(providerType)) {
        case 'email':
            return topic.emailTotal;
        case 'sms':
            return topic.smsTotal;
        case 'push':
            return topic.pushTotal;
        default:
            return 0;
    }
}
