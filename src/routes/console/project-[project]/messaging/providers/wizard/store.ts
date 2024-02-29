import type { MessagingProviderType } from '@appwrite.io/console';
import { writable } from 'svelte/store';
import type { Providers } from '../../provider.svelte';
import type {
    APNSProviderParams,
    FCMProviderParams,
    MailgunProviderParams,
    Msg91ProviderParams,
    SMTPProviderParams,
    SendgridProviderParams,
    TelesignProviderParams,
    TextmagicProviderParams,
    TwilioProviderParams,
    VonageProviderParams
} from '../store';

export const providerType = writable<MessagingProviderType>(null);
export const provider = writable<Providers>(null);
export const providerParams = writable<{
    twilio: Partial<TwilioProviderParams>;
    msg91: Partial<Msg91ProviderParams>;
    telesign: Partial<TelesignProviderParams>;
    textmagic: Partial<TextmagicProviderParams>;
    vonage: Partial<VonageProviderParams>;
    mailgun: Partial<MailgunProviderParams>;
    sendgrid: Partial<SendgridProviderParams>;
    smtp: Partial<SMTPProviderParams>;
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
    smtp: null,
    fcm: null,
    apns: null
});
