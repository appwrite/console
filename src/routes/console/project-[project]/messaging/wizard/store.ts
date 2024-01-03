import { ProviderTypes } from '../providerType.svelte';
import { writable } from 'svelte/store';
import type { Target } from '../store';

export enum MessageStatuses {
    DRAFT = 'draft',
    PROCESSING = 'processing'
}

export type MessageParams = {
    messageId: string;
    topics: string[];
    users: string[];
    targets: string[];
    description: string;
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

export const providerType = writable<ProviderTypes>(null);
export const targetsById = writable<Record<string, Target>>({});
export const messageParams = writable<{
    [ProviderTypes.Email]: Partial<EmailMessageParams>;
    [ProviderTypes.Sms]: Partial<SMSMessageParams>;
    [ProviderTypes.Push]: Partial<PushMessageParams>;
}>({
    [ProviderTypes.Email]: null,
    [ProviderTypes.Sms]: null,
    [ProviderTypes.Push]: null
});
