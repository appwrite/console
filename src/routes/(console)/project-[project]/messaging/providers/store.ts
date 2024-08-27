import type { Column } from '$lib/helpers/types';
import { MessagingProviderType, SmtpEncryption } from '@appwrite.io/console';
import { writable } from 'svelte/store';
import { Providers } from '../provider.svelte';
import { base } from '$app/paths';

export const columns = writable<Column[]>([
    { id: '$id', title: 'Provider ID', type: 'string', show: true },
    { id: 'name', title: 'Name', type: 'string', show: true },
    { id: 'provider', title: 'Provider', type: 'string', show: true },
    { id: 'type', title: 'Type', type: 'string', show: true },
    { id: 'enabled', title: 'Status', type: 'boolean', show: true }
]);

export type ProviderInput = {
    label: string;
    name: string;
    type:
        | 'text'
        | 'password'
        | 'phone'
        | 'email'
        | 'domain'
        | 'file'
        | 'switch'
        | 'select'
        | 'checkbox';
    placeholder?: string;
    description?: string;
    tooltip?: string;
    popover?: string[];
    popoverImage?: { src: { light: string; dark: string }; alt: string };
    allowedFileExtensions?: string[];
    optional?: boolean;
    options?: { label: string; value: string | number | boolean }[];
};

type ProvidersMap = {
    [key in MessagingProviderType]: {
        name: string;
        text: string;
        icon: string;
        providers: {
            [key in Providers]?: {
                imageIcon?: string;
                classIcon?: string;
                title: string;
                description: string;
                needAHand?: string[];
                configure: (ProviderInput | ProviderInput[])[];
            };
        };
    };
};

export const providers: ProvidersMap = {
    [MessagingProviderType.Push]: {
        name: 'Push notification',
        text: 'notifications',
        icon: 'device-mobile',
        providers: {
            [Providers.FCM]: {
                imageIcon: 'firebase',
                title: 'FCM',
                description: 'Firebase Cloud Messaging',
                needAHand: [
                    'Create a <b><a class="link" href="https://firebase.google.com" target="_blank" rel="noopener noreferrer">Firebase</a></b> project.',
                    'Head to <b>Firebase dashboard -> Settings -> Project settings -> Cloud Messaging.</b>',
                    "If FCM is disabled, click the three-dots menu and open the link. On the following page, click 'Enable' (it might take a few minutes for the action to complete)."
                ],
                configure: [
                    {
                        label: 'Service account JSON (.json file)',
                        name: 'serviceAccountJSON',
                        type: 'file',
                        allowedFileExtensions: ['json'],
                        placeholder: 'Enter service account JSON',
                        popover: [
                            '<b>How to get the <a class="link" href="https://firebase.google.com" target="_blank" rel="noopener noreferrer">FCM</a> service account JSON?</b>',
                            'Head to <b>Project settings -> Service accounts -> Generate new private key.</b>',
                            'Generating the new key will result in the download of a JSON file.'
                        ],
                        popoverImage: {
                            src: {
                                light:
                                    base + '/images/messaging/fcm-service-account-json-light.png',
                                dark: base + '/images/messaging/fcm-service-account-json-dark.png'
                            },
                            alt: 'Screenshot of how to generate the Firebase Service Account JSON file'
                        }
                    }
                ]
            },
            [Providers.APNS]: {
                imageIcon: 'apple',
                title: 'APNS',
                description: 'Apple Push Notification Service',
                configure: [
                    {
                        label: 'Team ID',
                        name: 'teamId',
                        type: 'text',
                        placeholder: 'Enter team ID',
                        popover: [
                            '<b>How to get the team ID?</b>',
                            'Head to <b><a style="link" href="https://developer.apple.com/account" target="_blank" rel="noopener noreferrer">Apple Developer Member Center</a> -> Membership details -> Team ID.</b>'
                        ],
                        popoverImage: {
                            src: {
                                light: base + '/images/messaging/apns-team-id.png',
                                dark: base + '/images/messaging/apns-team-id.png'
                            },
                            alt: 'Screenshot of where to find the Team ID in the Apple Developer Member Center'
                        }
                    },
                    {
                        label: 'Bundle ID',
                        name: 'bundleId',
                        type: 'text',
                        placeholder: 'Enter bundle ID',
                        popover: [
                            '<b>How to get the bundle ID?</b>',
                            'Head to <b><a class="link" href="https://developer.apple.com/account" target="_blank" rel="noopener noreferrer">Apple Developer Member Center</a> -> Certificates, Identifiers & Profiles -> Identifiers.</b>'
                        ],
                        popoverImage: {
                            src: {
                                light: base + '/images/messaging/apns-bundle-id.png',
                                dark: base + '/images/messaging/apns-bundle-id.png'
                            },
                            alt: 'Screenshot of where to find the Bundle ID in the Apple Developer Member Center'
                        }
                    },
                    {
                        label: 'Authentication key ID',
                        name: 'authKeyId',
                        type: 'text',
                        placeholder: 'Enter key ID',
                        popover: [
                            '<b>How to get the auth key ID?</b>',
                            'Head to <b><a class="link" href="https://developer.apple.com/account" target="_blank" rel="noopener noreferrer">Apple Developer Member Center</a> -> Certificates, Identifiers & Profiles -> Keys.</b>',
                            'Click on your key to view details.'
                        ],
                        popoverImage: {
                            src: {
                                light: base + '/images/messaging/apns-authentication-key-id.png',
                                dark: base + '/images/messaging/apns-authentication-key-id.png'
                            },
                            alt: 'Screenshot of how to find the Authentication Key ID in the Apple Developer Member Center'
                        }
                    },
                    {
                        label: 'Auth key (.p8 file)',
                        name: 'authKey',
                        type: 'file',
                        allowedFileExtensions: ['p8'],
                        popover: [
                            '<b>How to get the authentication key?</b>',
                            'Head to <b><a class="link" href="https://developer.apple.com/account" target="_blank" rel="noopener noreferrer">Apple Developer Member Center</a></b> (under Program resources) <b>-> Certificates, Identifiers & Profiles -> Keys.</b>',
                            'Create a key and give it a name. Enable the Apple Push Notifications service (APNS), and register your key.'
                        ],
                        popoverImage: {
                            src: {
                                light: base + '/images/messaging/apns-auth-key.png',
                                dark: base + '/images/messaging/apns-auth-key.png'
                            },
                            alt: 'Screenshot of where to download the Authentication Key in the Apple Developer Member Center'
                        }
                    },
                    {
                        label: 'Sandbox',
                        name: 'sandbox',
                        type: 'switch',
                        description:
                            'Enable sandbox mode for testing on apps signed with development provisioning profiles. <a class="link" href="https://appwrite.io/docs/products/messaging/apns#configure-provider" target="_blank" rel="noopener noreferrer">Learn more</a>.'
                    }
                ]
            }
            // [Providers.MQTT]: {
            //     imageIcon: 'mqtt',
            //     title: 'MQTT',
            //     description: 'Message Queuing Telemetry Transport'
            // }
        }
    },
    [MessagingProviderType.Email]: {
        name: 'Email',
        text: 'emails',
        icon: 'mail',
        providers: {
            [Providers.Mailgun]: {
                imageIcon: 'mailgun',
                title: 'Mailgun',
                description: '',
                configure: [
                    {
                        label: 'API key',
                        name: 'apiKey',
                        type: 'password',
                        placeholder: 'Enter API key',
                        popover: [
                            '<b>How to get the API key?</b>',
                            'Create an account in <a class="link" href="https://signup.mailgun.com/new/signup" target="_blank" rel="noopener noreferrer">Mailgun</a>.',
                            'Head to <b>Profile -> API Security -> Add new key.</b>'
                        ]
                    },
                    {
                        label: 'Domain',
                        name: 'domain',
                        type: 'domain',
                        placeholder: 'Enter domain',
                        popover: [
                            '<b>How to create a domain?</b>',
                            'Head to <b>Sending -> Domains -> Add new domain.</b>',
                            'Follow <b><a class="link" href="https://signup.mailgun.com/new/signup" target="_blank" rel="noopener noreferrer">Mailgun</a> instructions</b> to verify the domain name.'
                        ]
                    },
                    {
                        label: 'EU region',
                        name: 'isEuRegion',
                        type: 'switch',
                        description:
                            'Enable the EU region setting if your domain is within the European Union.'
                    },
                    [
                        {
                            label: 'Sender email',
                            name: 'fromEmail',
                            type: 'email',
                            placeholder: 'Enter email'
                        },
                        {
                            label: 'Sender name',
                            name: 'fromName',
                            type: 'text',
                            optional: true,
                            placeholder: 'Enter name'
                        }
                    ],
                    [
                        {
                            label: 'Reply-to email',
                            name: 'replyToEmail',
                            type: 'email',
                            optional: true,
                            placeholder: 'Enter email'
                        },
                        {
                            label: 'Reply-to name',
                            name: 'replyToName',
                            type: 'text',
                            optional: true,
                            placeholder: 'Enter name'
                        }
                    ]
                ]
            },
            [Providers.Sendgrid]: {
                imageIcon: 'sendgrid',
                title: 'SendGrid',
                description: '',
                configure: [
                    {
                        label: 'API key',
                        name: 'apiKey',
                        type: 'password',
                        placeholder: 'Enter API key',
                        popover: [
                            '<b>How to get the API key?</b>',
                            'Create an account in <a class="link" href="https://login.sendgrid.com/login/identifier" target="_blank" rel="noopener noreferrer">SendGrid</a>.',
                            'Head to <b>Settings -> API Keys -> Create API key.</b>'
                        ]
                    },
                    [
                        {
                            label: 'Sender email',
                            name: 'fromEmail',
                            type: 'email',
                            placeholder: 'Enter email'
                        },
                        {
                            label: 'Sender name',
                            name: 'fromName',
                            type: 'text',
                            optional: true,
                            placeholder: 'Enter name'
                        }
                    ],
                    [
                        {
                            label: 'Reply-to email',
                            name: 'replyToEmail',
                            type: 'email',
                            optional: true,
                            placeholder: 'Enter email'
                        },
                        {
                            label: 'Reply-to name',
                            name: 'replyToName',
                            type: 'text',
                            optional: true,
                            placeholder: 'Enter name'
                        }
                    ]
                ]
            },
            [Providers.SMTP]: {
                classIcon: 'mail',
                title: 'SMTP',
                description: 'Generic SMTP server',
                configure: [
                    {
                        label: 'Server host',
                        name: 'host',
                        type: 'text',
                        placeholder: 'smtp.server.com'
                    },
                    {
                        label: 'Server port',
                        name: 'port',
                        type: 'text',
                        optional: true,
                        placeholder: 'Enter port'
                    },
                    {
                        label: 'Username',
                        name: 'username',
                        type: 'text',
                        optional: true,
                        placeholder: 'Enter username'
                    },
                    {
                        label: 'Password',
                        name: 'password',
                        type: 'password',
                        optional: true,
                        placeholder: 'Enter password'
                    },
                    {
                        label: 'Encryption',
                        name: 'encryption',
                        type: 'select',
                        options: [
                            { label: 'None', value: SmtpEncryption.None },
                            { label: 'SSL', value: SmtpEncryption.Ssl },
                            { label: 'TLS', value: SmtpEncryption.Tls }
                        ]
                    },
                    {
                        label: 'Auto TLS',
                        name: 'autoTLS',
                        description: 'Automatically uses TLS encryption if available.',
                        type: 'checkbox',
                        optional: true
                    },
                    [
                        {
                            label: 'Sender email',
                            name: 'fromEmail',
                            type: 'email',
                            placeholder: 'Enter email'
                        },
                        {
                            label: 'Sender name',
                            name: 'fromName',
                            type: 'text',
                            optional: true,
                            placeholder: 'Enter name'
                        }
                    ],
                    [
                        {
                            label: 'Reply-to email',
                            name: 'replyToEmail',
                            type: 'email',
                            optional: true,
                            placeholder: 'Enter email'
                        },
                        {
                            label: 'Reply-to name',
                            name: 'replyToName',
                            type: 'text',
                            optional: true,
                            placeholder: 'Enter name'
                        }
                    ],
                    {
                        label: 'X-Mailer header',
                        name: 'mailer',
                        type: 'text',
                        optional: true,
                        placeholder: 'Enter mailer',
                        tooltip:
                            'The X-Mailer header is used to identify the software or client used for composing or sending the email. It typically includes information such as the name and version of the email program, aiding in troubleshooting and debugging.'
                    }
                ]
            }
        }
    },

    [MessagingProviderType.Sms]: {
        name: 'SMS',
        text: 'SMS',
        icon: 'annotation',
        providers: {
            [Providers.Twilio]: {
                imageIcon: 'twilio',
                title: 'Twilio',
                description: '',
                needAHand: [
                    'Create an account in <b><a class="link" href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer">Twilio</a></b>.',
                    'Head to <b>Twilio console -> Get a Twilio phone number.</b>'
                ],
                configure: [
                    {
                        label: 'Account SID',
                        name: 'accountSid',
                        type: 'text',
                        placeholder: 'Enter Account SID',
                        popover: [
                            '<b>How to get the Account SID?</b>',
                            'Head to <b><a class="link" href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer">Twilio</a> console -> Account info -> Account SID.</b>'
                        ]
                    },
                    {
                        label: 'Auth token',
                        name: 'authToken',
                        type: 'password',
                        placeholder: 'Enter Auth token',
                        popover: [
                            '<b>How to get the Auth token?</b>',
                            'Head to <b><a class="link" href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer">Twilio</a> console -> Account info -> Auth Token.</b>'
                        ]
                    },
                    {
                        label: 'Sender number',
                        name: 'from',
                        type: 'phone',
                        placeholder: 'Enter phone',
                        popover: [
                            '<b>How to get sender number?</b>',
                            'Head to <b><a class="link" href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer">Twilio</a> console -> Develop -> Phone Numbers -> Manage -> Active Numbers.</b>',
                            'If you have multiple <a class="link" href="https://console.twilio.com/" target="_blank" rel="noopener noreferrer">Twilio</a> phone numbers, you can select one as the default number.'
                        ]
                    }
                ]
            },
            [Providers.Msg91]: {
                imageIcon: 'msg91',
                title: 'MSG91',
                description: '',
                configure: [
                    {
                        label: 'Auth key',
                        name: 'authKey',
                        type: 'password',
                        placeholder: 'Enter auth key',
                        popover: [
                            '<b>How to get the Auth key?</b>',
                            'Create an account in <a class="link" href="https://control.msg91.com/signin/" target="_blank" rel="noopener noreferrer">MSG91</a>.',
                            'Click to open the <b>Username dropdown -> Authkey -> Verify your mobile number -> Create Authkey.</b>'
                        ]
                    },
                    {
                        label: 'Sender ID',
                        name: 'senderId',
                        type: 'text',
                        placeholder: 'Enter sender ID',
                        popover: [
                            '<b>How to create a Sender ID?</b>',
                            'Head to <b><a class="link" href="https://control.msg91.com/signin/" target="_blank" rel="noopener noreferrer">MSG91</a> dashboard -> SMS -> Sender ID -> Create Sender ID.</b>'
                        ]
                    },
                    {
                        label: 'Template ID',
                        name: 'templateId',
                        type: 'text',
                        placeholder: 'Enter template ID',
                        popover: [
                            '<b>How to create a Template ID?</b>',
                            'Head to <b><a class="link" href="https://control.msg91.com/signin/" target="_blank" rel="noopener noreferrer">MSG91</a> dashboard -> SMS -> Templates -> Create Template.</b>'
                        ]
                    }
                ]
            },
            [Providers.Telesign]: {
                imageIcon: 'telesign',
                title: 'Telesign',
                description: '',
                configure: [
                    {
                        label: 'Customer ID',
                        name: 'customerId',
                        type: 'text',
                        placeholder: 'Enter customer ID'
                    },
                    {
                        label: 'API Key',
                        name: 'apiKey',
                        type: 'password',
                        placeholder: 'Enter API key',
                        popover: [
                            '<b>How to get the API key?</b>',
                            'Create an account in <a class="link" href="https://portal.telesign.com/" target="_blank" rel="noopener noreferrer">Telesign</a>.',
                            'Head to <b>Telesign portal -> Profile -> API Keys.</b>'
                        ]
                    },
                    {
                        label: 'Sender number',
                        name: 'from',
                        type: 'phone',
                        placeholder: 'Enter phone'
                    }
                ]
            },
            [Providers.Textmagic]: {
                imageIcon: 'textmagic',
                title: 'Textmagic',
                description: '',
                configure: [
                    {
                        label: 'API key',
                        name: 'apiKey',
                        type: 'password',
                        placeholder: 'Enter API key',
                        popover: [
                            '<b>How to get the API key?</b>',
                            'Create an account in <a class="link" href="https://app.textmagic.com/login" target="_blank" rel="noopener noreferrer">Textmagic</a>.',
                            'Head to <b><a class="link" href="https://app.textmagic.com/login" target="_blank" rel="noopener noreferrer">Textmagic</a>  dashboard -> Services -> API -> Add new API key.</b>'
                        ]
                    },
                    {
                        label: 'Username',
                        name: 'username',
                        type: 'text',
                        placeholder: 'Enter username'
                    },
                    {
                        label: 'Sender number',
                        name: 'from',
                        type: 'phone',
                        placeholder: 'Enter phone'
                    }
                ]
            },
            [Providers.Vonage]: {
                imageIcon: 'vonage',
                title: 'Vonage',
                description: '',
                configure: [
                    {
                        label: 'API key',
                        name: 'apiKey',
                        type: 'password',
                        placeholder: 'Enter API key',
                        popover: [
                            '<b>How to get the API key?</b>',
                            'Create an account in <a class="link" href="https://dashboard.nexmo.com/sign-in" target="_blank" rel="noopener noreferrer">Vonage</a>.',
                            'Head to <b><a class="link" href="https://dashboard.nexmo.com/sign-in" target="_blank" rel="noopener noreferrer">Vonage</a> dashboard and copy the API key.</b>'
                        ]
                    },
                    {
                        label: 'API secret',
                        name: 'apiSecret',
                        type: 'password',
                        placeholder: 'Enter API secret',
                        popover: [
                            '<b>How to get the API secret?</b>',
                            'Head to <b><a class="link" href="https://dashboard.nexmo.com/sign-in" target="_blank" rel="noopener noreferrer">Vonage</a> dashboard and copy the API secret.</b>'
                        ]
                    },
                    {
                        label: 'Sender number',
                        name: 'from',
                        type: 'phone',
                        placeholder: 'Enter phone'
                    }
                ]
            }
        }
    }
};

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
    templateId: string;
    senderId: string;
    authKey: string;
};

export type TelesignProviderParams = ProviderParams & {
    from: string;
    customerId: string;
    apiKey: string;
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

export type SMTPProviderParams = ProviderParams & {
    fromEmail: string;
    fromName: string;
    replyToEmail: string;
    replyToName: string;
    host: string;
    port: number;
    username: string;
    password: string;
    encryption: SmtpEncryption;
    autoTLS: boolean;
    mailer: string;
};

/**
 * Push providers
 */
export type FCMProviderParams = ProviderParams & {
    serviceAccountJSON: string;
};

export type APNSProviderParams = ProviderParams & {
    authKey: string;
    authKeyId: string;
    teamId: string;
    bundleId: string;
    sandbox: boolean;
};

export type MQTTProviderParams = ProviderParams & {
    serverKey: string;
};
