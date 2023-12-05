import type { Column } from '$lib/helpers/types';
import { Providers } from './provider.svelte';
import { ProviderTypes } from './providerType.svelte';
import { writable } from 'svelte/store';

export const showCreate = writable(false);

export const columns = writable<Column[]>([
    { id: '$id', title: 'Message ID', type: 'string', show: true, width: 140 },
    { id: 'description', title: 'Description', type: 'string', show: true, width: 140 },
    { id: 'message', title: 'Message', type: 'string', show: false, width: 140 },
    { id: 'providerType', title: 'Type', type: 'string', show: true, width: 100 },
    { id: 'status', title: 'Status', type: 'string', show: true, width: 120 },
    { id: 'scheduledAt', title: 'Scheduled at', type: 'datetime', show: true, width: 120 },
    { id: 'deliveredAt', title: 'Delivered at', type: 'datetime', show: false, width: 120 }
]);

export const targetsById = writable<Record<string, Target>>({});
export const topicsById = writable<Record<string, Topic>>({});

// TODO: remove this when the SDK and API are ready
export type Message = {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    topics: string[];
    users: string[];
    targets: string[];
    scheduledAt: string;
    deliveredAt: string;
    deliveryErrors: string[];
    deliveredTo: number;
    status: string;
    providerType: ProviderTypes;
    description: string;
    data: {
        content?: string;
        body?: string;
        subject?: string;
        title?: string;
    };
};

// TODO: remove this when the SDK and API are ready
export const messages: { messages: Message[]; total: number } = {
    messages: [
        {
            $id: '637a40ba7a703e3936e1',
            $createdAt: '2021-08-31T12:00:00.000Z',
            $updatedAt: '2021-08-31T12:00:00.000Z',
            description: 'Welcome',
            providerType: ProviderTypes.Push,
            topics: [],
            users: ['user-1', 'user-2'],
            targets: [],
            scheduledAt: '2021-03-01T00:00:00.000Z',
            deliveredAt: '2021-03-01T00:00:00.000Z',
            deliveryErrors: [],
            deliveredTo: 2,
            status: 'sent',
            data: {
                title: 'Welcome to the Cloud',
                body: 'Detailed body'
            }
        },
        {
            $id: '637a40ba7a703e3936e2',
            $createdAt: '2021-08-31T12:00:00.000Z',
            $updatedAt: '2021-08-31T12:00:00.000Z',
            description: 'Public beta announcement',
            providerType: ProviderTypes.Sms,
            topics: [],
            users: ['user-1', 'user-2'],
            targets: [],
            scheduledAt: '2021-03-01T00:00:00.000Z',
            deliveredAt: '2021-03-01T00:00:00.000Z',
            deliveryErrors: [],
            deliveredTo: 2,
            status: 'scheduled',
            data: {
                content: 'Cloud is live on public beta'
            }
        },
        {
            $id: '637a40ba7a703e3936e3',
            $createdAt: '2021-08-31T12:00:00.000Z',
            $updatedAt: '2021-08-31T12:00:00.000Z',
            description: 'Welcome',
            providerType: ProviderTypes.Email,
            topics: [],
            users: ['user-1', 'user-2'],
            targets: [],
            scheduledAt: '',
            deliveredAt: '',
            deliveryErrors: [],
            deliveredTo: 2,
            status: 'draft',
            data: {
                subject: 'Welcome to the Cloud',
                content: 'Detailed content'
            }
        }
    ],
    total: 3
};

// TODO: remove this when the SDK and API are ready
export type Provider = {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    name: string;
    provider: Providers;
    default: boolean;
    enabled: boolean;
    type: ProviderTypes;
    credentials: object;
    options: object;
};

// TODO: remove this when the SDK and API are ready
export const providersById: { [providerId: string]: Provider } = {
    '637a40ba7a703e3936e1': {
        $id: '637a40ba7a703e3936e1',
        $createdAt: '2021-08-31T12:00:00.000Z',
        $updatedAt: '2021-08-31T12:00:00.000Z',
        name: 'My Firebase',
        provider: Providers.FCM,
        type: ProviderTypes.Push,
        default: false,
        enabled: true,
        credentials: {},
        options: {}
    },
    '637a40ba7a703e3936e2': {
        $id: '637a40ba7a703e3936e2',
        $createdAt: '2021-08-31T12:00:00.000Z',
        $updatedAt: '2021-08-31T12:00:00.000Z',
        name: 'My APNS',
        provider: Providers.APNS,
        type: ProviderTypes.Push,
        default: false,
        enabled: false,
        credentials: {},
        options: {}
    },
    '637a40ba7a703e3936e3': {
        $id: '637a40ba7a703e3936e3',
        $createdAt: '2021-08-31T12:00:00.000Z',
        $updatedAt: '2021-08-31T12:00:00.000Z',
        name: 'My MQTT',
        provider: Providers.MQTT,
        type: ProviderTypes.Push,
        default: false,
        enabled: false,
        credentials: {},
        options: {}
    },
    '637a40ba7a703e3936e4': {
        $id: '637a40ba7a703e3936e4',
        $createdAt: '2021-08-31T12:00:00.000Z',
        $updatedAt: '2021-08-31T12:00:00.000Z',
        name: 'My Sendgrid',
        provider: Providers.Sendgrid,
        type: ProviderTypes.Email,
        default: false,
        enabled: false,
        credentials: {},
        options: {}
    },
    '637a40ba7a703e3936e5': {
        $id: '637a40ba7a703e3936e5',
        $createdAt: '2021-08-31T12:00:00.000Z',
        $updatedAt: '2021-08-31T12:00:00.000Z',
        name: 'My Mailgun',
        provider: Providers.Mailgun,
        type: ProviderTypes.Email,
        default: false,
        enabled: false,
        credentials: {},
        options: {}
    },
    '637a40ba7a703e3936e6': {
        $id: '637a40ba7a703e3936e6',
        $createdAt: '2021-08-31T12:00:00.000Z',
        $updatedAt: '2021-08-31T12:00:00.000Z',
        name: 'My Telesign',
        provider: Providers.Telesign,
        type: ProviderTypes.Sms,
        default: false,
        enabled: false,
        credentials: {},
        options: {}
    },
    '637a40ba7a703e3936e7': {
        $id: '637a40ba7a703e3936e7',
        $createdAt: '2021-08-31T12:00:00.000Z',
        $updatedAt: '2021-08-31T12:00:00.000Z',
        name: 'My Msg91',
        provider: Providers.Msg91,
        type: ProviderTypes.Sms,
        default: false,
        enabled: false,
        credentials: {},
        options: {}
    },
    '637a40ba7a703e3936e8': {
        $id: '637a40ba7a703e3936e8',
        $createdAt: '2021-08-31T12:00:00.000Z',
        $updatedAt: '2021-08-31T12:00:00.000Z',
        name: 'My Textmagic',
        provider: Providers.Textmagic,
        type: ProviderTypes.Sms,
        default: false,
        enabled: false,
        credentials: {},
        options: {}
    },
    '637a40ba7a703e3936e9': {
        $id: '637a40ba7a703e3936e9',
        $createdAt: '2021-08-31T12:00:00.000Z',
        $updatedAt: '2021-08-31T12:00:00.000Z',
        name: 'My Vonage',
        provider: Providers.Vonage,
        type: ProviderTypes.Sms,
        default: false,
        enabled: false,
        credentials: {},
        options: {}
    },
    '637a40ba7a703e3936f0': {
        $id: '637a40ba7a703e3936f0',
        $createdAt: '2021-08-31T12:00:00.000Z',
        $updatedAt: '2021-08-31T12:00:00.000Z',
        name: 'My Twilio',
        provider: Providers.Twilio,
        type: ProviderTypes.Sms,
        default: false,
        enabled: false,
        credentials: {},
        options: {}
    }
};

// TODO: remove when sdk has the model
export type Topic = {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    providerId: string;
    name: string;
    total: number;
    description: string;
};

export type Target = {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    name: string;
    userId: string;
    providerId: string;
    providerType: ProviderTypes;
    identifier: string;
};
