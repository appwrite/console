import type { Models } from '@appwrite.io/console';
import { writable } from 'svelte/store';
import { ProviderTypes } from '../providerType.svelte';

export enum MessageStatuses {
    DRAFT = 'draft',
    SCHEDULED = 'scheduled',
    PROCESSING = 'processing',
    SENT = 'sent',
    FAILED = 'failed'
}

export type MessageParams = {
    messageId: string;
    topics: string[];
    users: string[];
    targets: string[];
    status: MessageStatuses;
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
    action?: string;
    icon?: string;
    sound?: string;
    color?: string;
    tag?: string;
    badge?: string;
};

export const operation = writable<'create' | 'update'>('create');
export const providerType = writable<ProviderTypes>(null);
export const targetsById = writable<Record<string, Models.Target>>({});
export const messageParams = writable<{
    [ProviderTypes.Email]: Partial<EmailMessageParams>;
    [ProviderTypes.Sms]: Partial<SMSMessageParams>;
    [ProviderTypes.Push]: Partial<PushMessageParams>;
}>({
    [ProviderTypes.Email]: null,
    [ProviderTypes.Sms]: null,
    [ProviderTypes.Push]: null
});
