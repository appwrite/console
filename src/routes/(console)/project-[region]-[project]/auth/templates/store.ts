import { writable } from 'svelte/store';
import { EmailTemplateType, type EmailTemplateLocale, type Models } from '@appwrite.io/console';

// component imports
import Email2FaTemplate from './email2FATemplate.svelte';
import EmailInviteTemplate from './emailInviteTemplate.svelte';
import EmailMagicUrlTemplate from './emailMagicUrlTemplate.svelte';
import EmailRecoveryTemplate from './emailRecoveryTemplate.svelte';
import EmailOtpSessionTemplate from './emailOtpSessionTemplate.svelte';
import EmailVerificationTemplate from './emailVerificationTemplate.svelte';
import EmailSessionAlertTemplate from './emailSessionAlertTemplate.svelte';

export type EmailTemplateForm = Models.EmailTemplate & {
    type: EmailTemplateType | null;
    templateId: EmailTemplateType | string | null;
    locale: EmailTemplateLocale | string | null;
    replyTo: string | null;
};

export type SmsTemplateForm = {
    type: string | null;
    locale: string | null;
    message: string | null;
};

export const emailTemplate = writable<EmailTemplateForm>({
    templateId: null,
    type: null,
    locale: null,
    message: null,
    senderName: '',
    senderEmail: null,
    replyTo: null,
    replyToEmail: null,
    replyToName: null,
    subject: null
});

export const baseEmailTemplate = writable<EmailTemplateForm>({
    templateId: null,
    type: null,
    locale: null,
    message: null,
    senderName: null,
    senderEmail: null,
    replyTo: null,
    replyToEmail: null,
    replyToName: null,
    subject: null
});

export const smsTemplate = writable<SmsTemplateForm>({
    type: null,
    locale: null,
    message: null
});

export const baseSmsTemplate = writable<SmsTemplateForm>({
    type: null,
    locale: null,
    message: null
});

export const templates = [
    {
        key: EmailTemplateType.Verification,
        title: 'Verification',
        description:
            'Send a verification email to users that sign in with their email and password.',
        component: EmailVerificationTemplate
    },
    {
        key: EmailTemplateType.MagicSession,
        title: 'Magic URL',
        description: 'Send an email to users that sign in with a magic URL.',
        component: EmailMagicUrlTemplate
    },
    {
        key: EmailTemplateType.OtpSession,
        title: 'OTP session',
        description: 'Send an email to users that sign in with a email OTP.',
        component: EmailOtpSessionTemplate
    },
    {
        key: EmailTemplateType.Recovery,
        title: 'Reset password',
        description: 'Send a recovery email to users that forget their password.',
        component: EmailRecoveryTemplate
    },
    {
        key: EmailTemplateType.Invitation,
        title: 'Invite user',
        description: 'Send an invitation email to become a member of your project.',
        component: EmailInviteTemplate
    },
    {
        key: EmailTemplateType.MfaChallenge,
        title: '2FA verification',
        description: 'Send a two-factor authentication email to a user.',
        component: Email2FaTemplate
    },
    {
        key: EmailTemplateType.SessionAlert,
        title: 'Session alert',
        description: 'Send an email to users when a new session is created.',
        component: EmailSessionAlertTemplate,
        hideDivider: true
    }
];
