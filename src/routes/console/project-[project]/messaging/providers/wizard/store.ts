import type { Models } from '@appwrite.io/console';
import type { Providers } from '../../provider.svelte';
import type { ProviderTypes } from '../../providerType.svelte';
import { writable } from 'svelte/store';

type ProviderParams = {
    providerId: string;
    name: string;
    enabled: boolean;
};

/**
 * SMS providers
 */

export type TwilioProviderParams = ProviderParams & {
    accountSid: string;
    authToken: string;
    from: string;
};

export type Msg91ProviderParams = ProviderParams & {
    from: string;
    senderId: string;
    authKey: string;
};

export type TelesignProviderParams = ProviderParams & {
    from: string;
    username: string;
    password: string;
};

export type TextmagicProviderParams = ProviderParams & {
    from: string;
    username: string;
    apiKey: string;
};

export type VonageProviderParams = ProviderParams & {
    from: string;
    apiKey: string;
    apiSecret: string;
};

/**
 * Email providers
 */

export type MailgunProviderParams = ProviderParams & {
    fromEmail: string;
    fromName: string;
    replyToEmail: string;
    replyToName: string;
    isEuRegion: boolean;
    apiKey: string;
    domain: string;
};

export type SendgridProviderParams = ProviderParams & {
    fromEmail: string;
    fromName: string;
    replyToEmail: string;
    replyToName: string;
    apiKey: string;
};

/**
 * Push providers
 */

export type FCMProviderParams = ProviderParams & {
    serverKey: string;
};

export type APNSProviderParams = ProviderParams & {
    authKey: string;
    authKeyId: string;
    teamId: string;
    bundleId: string;
};

export type MQTTProviderParams = ProviderParams & {
    serverKey: string;
};

export const providerType = writable<Models.Provider['type']>(null);
export const provider = writable<Models.Provider['provider']>(null);
export const providerParams = writable<{
    twilio: Partial<TwilioProviderParams>;
    msg91: Partial<Msg91ProviderParams>;
    telesign: Partial<TelesignProviderParams>;
    textmagic: Partial<TextmagicProviderParams>;
    vonage: Partial<VonageProviderParams>;
    mailgun: Partial<MailgunProviderParams>;
    sendgrid: Partial<SendgridProviderParams>;
    fcm: Partial<FCMProviderParams>;
    apns: Partial<APNSProviderParams>;
}>({
    twilio: null,
    msg91: null,
    telesign: null,
    textmagic: null,
    vonage: null,
    mailgun: null,
    sendgrid: null,
    fcm: null,
    apns: null
});
