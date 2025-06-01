import { page } from '$app/stores';
import { derived, writable } from 'svelte/store';
import type { Models } from '@appwrite.io/console';

// component imports
import Email2FaTemplate from './email2FATemplate.svelte';
import EmailInviteTemplate from './emailInviteTemplate.svelte';
import EmailRecoveryTemplate from './emailRecoveryTemplate.svelte';
import EmailMagicUrlTemplate from './emailMagicUrlTemplate.svelte';
import EmailVerificationTemplate from './emailVerificationTemplate.svelte';
import EmailSessionAlertTemplate from './emailSessionAlertTemplate.svelte';

export const localeCodes = derived(page, ($page) => $page.data.localeCodes as Models.LocaleCode[]);

export const emailTemplate = writable<Models.EmailTemplate>({
    type: null,
    locale: null,
    message: null,
    senderName: '',
    senderEmail: null,
    replyTo: null,
    subject: null
});

export const baseEmailTemplate = writable<Models.EmailTemplate>({
    type: null,
    locale: null,
    message: null,
    senderName: null,
    senderEmail: null,
    replyTo: null,
    subject: null
});

export const smsTemplate = writable<Models.SmsTemplate>({
    type: null,
    locale: null,
    message: null
});

export const baseSmsTemplate = writable<Models.SmsTemplate>({
    type: null,
    locale: null,
    message: null
});

export const templates = [
    {
        key: 'verification',
        title: 'Verification',
        description:
            'Send a verification email to users that sign in with their email and password.',
        component: EmailVerificationTemplate
    },
    {
        key: 'magicSession',
        title: 'Magic URL',
        description: 'Send an email to users that sign in with a magic URL.',
        component: EmailMagicUrlTemplate
    },
    {
        key: 'otpSession',
        title: 'OTP session',
        description: 'Send an email to users that sign in with a email OTP.',
        component: EmailMagicUrlTemplate
    },
    {
        key: 'recovery',
        title: 'Reset password',
        description: 'Send a recovery email to users that forget their password.',
        component: EmailRecoveryTemplate
    },
    {
        key: 'invitation',
        title: 'Invite user',
        description: 'Send an invitation email to become a member of your project.',
        component: EmailInviteTemplate
    },
    {
        key: 'mfaChallenge',
        title: '2FA verification',
        description: 'Send a two-factor authentication email to a user.',
        component: Email2FaTemplate
    },
    {
        key: 'sessionAlert',
        title: 'Session alert',
        description: 'Send an email to users when a new session is created.',
        component: EmailSessionAlertTemplate,
        hideDivider: true
    }
];
