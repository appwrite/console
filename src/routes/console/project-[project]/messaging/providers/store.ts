import type { Column } from '$lib/helpers/types';
import { writable } from 'svelte/store';
import { Providers } from '../provider.svelte';
import { MessagingProviderType, SMTPEncryption } from '@appwrite.io/console';

export const columns = writable<Column[]>([
    { id: '$id', title: 'Provider ID', type: 'string', show: true },
    { id: 'name', title: 'Name', type: 'string', show: true },
    { id: 'provider', title: 'Provider', type: 'string', show: true },
    { id: 'type', title: 'Type', type: 'string', show: true },
    { id: 'enabled', title: 'Status', type: 'boolean', show: true }
]);

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
                link: string;
                description: string;
                configure: {
                    label: string;
                    name: string;
                    type: 'text' | 'password' | 'phone' | 'email' | 'domain' | 'file' | 'switch' | 'select';
                    placeholder?: string;
                    description?: string;
                    popover?: string[];
                    allowedFileExtensions?: string[];
                    optional?: boolean;
                    options?: { label: string; value: string | number | boolean }[];
                }[];
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
                link: 'https://firebase.google.com/',
                description: 'Firebase Cloud Messaging',
                configure: [
                    {
                        label: 'Service account JSON (.json file)',
                        name: 'serviceAccountJSON',
                        type: 'file',
                        allowedFileExtensions: ['json'],
                        placeholder: 'Enter service account JSON',
                        popover: [
                            '<b>How to get the <a style="text-decoration:underline" href="https://firebase.google.com" target="_blank">FCM</a> service account JSON?</b>',
                            'Head to <b>Project settings -> Service accounts -> Generate new private key.</b>',
                            'Generating the new key will result in the download of a JSON file.'
                        ]
                    }
                ]
            },
            [Providers.APNS]: {
                imageIcon: 'apple',
                title: 'APNS',
                link: 'https://idmsa.apple.com/IDMSWebAuth/signin?appIdKey=891bd3417a7776362562d2197f89480a8547b108fd934911bcbea0110d07f757&path=%2Faccount%2F&rv=1',
                description: 'Apple Push Notification Service',
                configure: [
                    {
                        label: 'Team ID',
                        name: 'teamId',
                        type: 'text',
                        placeholder: 'Enter team ID',
                        popover: [
                            '<b>How to get the team ID?</b>',
                            'Head to <b><a style="text-decoration:underline" href="https://idmsa.apple.com/IDMSWebAuth/signin?appIdKey=891bd3417a7776362562d2197f89480a8547b108fd934911bcbea0110d07f757&path=%2Faccount%2F&rv=1" target="_blank">Apple Developer Member Center</a> -> Membership details -> Team ID.</b>'
                        ]
                    },
                    {
                        label: 'Bundle ID',
                        name: 'bundleId',
                        type: 'text',
                        placeholder: 'Enter bundle ID',
                        popover: [
                            '<b>How to get the bundle ID?</b>',
                            'Head to <b><a style="text-decoration:underline" href="https://idmsa.apple.com/IDMSWebAuth/signin?appIdKey=891bd3417a7776362562d2197f89480a8547b108fd934911bcbea0110d07f757&path=%2Faccount%2F&rv=1" target="_blank">Apple Developer Member Center</a> -> Certificates, Identifiers & Profiles -> Identifiers.</b>',
                            `<a
                                href="/images/apns-bundle-id.png"
                                class="file-preview is-with-image"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="open file in new window">
                                <div class="file-preview-image">
                                    <img
                                        width="205"
                                        height="125"
                                        src="/images/apns-bundle-id.png"
                                        alt="Screenshot of Bundle ID in Apple" />
                                </div>
                                <div class="file-preview-content">
                                    <div class="avatar">
                                        <span class="icon-external-link" aria-hidden="true" />
                                    </div>
                                </div>
                            </a>`
                        ]
                    },
                    {
                        label: 'Authentication key ID',
                        name: 'authKeyId',
                        type: 'text',
                        placeholder: 'Enter key ID',
                        popover: [
                            '<b>How to get the auth key ID?</b>',
                            'Head to <b><a style="text-decoration:underline" href="https://idmsa.apple.com/IDMSWebAuth/signin?appIdKey=891bd3417a7776362562d2197f89480a8547b108fd934911bcbea0110d07f757&path=%2Faccount%2F&rv=1" target="_blank">Apple Developer Member Center</a> -> Certificates, Identifiers & Profiles -> Keys.</b>',
                            'Click on your key to view details.'
                        ]
                    },
                    {
                        label: 'Auth key (.p8 file)',
                        name: 'authKey',
                        type: 'file',
                        allowedFileExtensions: ['p8'],
                        popover: [
                            '<b>How to get the authentication key?</b>',
                            'Head to <b><a style="text-decoration:underline" href="https://idmsa.apple.com/IDMSWebAuth/signin?appIdKey=891bd3417a7776362562d2197f89480a8547b108fd934911bcbea0110d07f757&path=%2Faccount%2F&rv=1" target="_blank">Apple Developer Member Center</a></b> (under Program resources) <b>-> Certificates, Identifiers & Profiles -> Keys.</b>',
                            'Create a key and give it a name. Enable the Apple Push Notifications service (APNS), and register your key.'
                        ]
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
                link: 'https://signup.mailgun.com/new/signup',
                description: '',
                configure: [
                    {
                        label: 'API key',
                        name: 'apiKey',
                        type: 'text',
                        placeholder: 'Enter API key',
                        popover: [
                            '<b>How to get the API key?</b>',
                            'Create an account in <a style="text-decoration:underline" href="https://signup.mailgun.com/new/signup" target="_blank">Mailgun</a>.',
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
                            'Follow <b><a style="text-decoration:underline" href="https://signup.mailgun.com/new/signup" target="_blank">Mailgun</a> instructions</b> to verify the domain name.'
                        ]
                    },
                    {
                        label: 'EU region',
                        name: 'isEuRegion',
                        type: 'switch',
                        description:
                            'Enable the EU region setting if your domain is within the European Union.'
                    },
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
                    },
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
            },
            [Providers.Sendgrid]: {
                imageIcon: 'sendgrid',
                title: 'Sendgrid',
                link: 'https://login.sendgrid.com/login/identifier?_gl=1*3vtcwz*_ga*MTMzODgwNDQ5OC4xNzA2MjAxMDUz*_ga_8W5LR442LD*MTcwNjIwMTA1My4xLjAuMTcwNjIwMTA1My4wLjAuMA..',
                description: '',
                configure: [
                    {
                        label: 'API key',
                        name: 'apiKey',
                        type: 'text',
                        placeholder: 'Enter API key',
                        popover: [
                            '<b>How to get the API key?</b>',
                            'Create an account in <a style="text-decoration:underline" href="https://login.sendgrid.com/login/identifier?_gl=1*3vtcwz*_ga*MTMzODgwNDQ5OC4xNzA2MjAxMDUz*_ga_8W5LR442LD*MTcwNjIwMTA1My4xLjAuMTcwNjIwMTA1My4wLjAuMA.." target="_blank">Sendgrid</a>.',
                            'Head to <b>Settings -> API Keys -> Create API key.</b>'
                        ]
                    },
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
                    },
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
            },
            [Providers.SMTP]: {
                classIcon: 'mail',
                title: 'SMTP',
                description: '',
                configure: [
                    {
                        label: 'Host',
                        name: 'host',
                        type: 'text',
                        placeholder: 'Enter host'
                    },
                    {
                        label: 'Port',
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
                        type: 'text',
                        optional: true,
                        placeholder: 'Enter password'
                    },
                    {
                        label: 'Encryption',
                        name: 'encryption',
                        type: 'select',
                        options: [
                            { label: 'None', value: SMTPEncryption.None },
                            { label: 'SSL', value: SMTPEncryption.Ssl },
                            { label: 'TLS', value: SMTPEncryption.Tls }
                        ]
                    },
                    {
                        label: 'Auto TLS',
                        name: 'autoTLS',
                        description: 'Automatically uses TLS encryption',
                        type: 'switch',
                        optional: true
                    },
                    {
                        label: 'Mailer',
                        name: 'mailer',
                        type: 'text',
                        optional: true,
                        placeholder: 'Enter mailer'
                    },
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
                    },
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
                link: 'https://login.twilio.com/u/signup?state=hKFo2SBaQktjdzI0ZHdKdm44QUc5YzBRXzlNMmlyTExkRWVTTaFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIHpwNUVrWDJzeFRJdUczVU5LTk16X0FHWEQ3dHU0S3hko2NpZNkgTW05M1lTTDVSclpmNzdobUlKZFI3QktZYjZPOXV1cks',
                description: '',
                configure: [
                    {
                        label: 'Account SID',
                        name: 'accountSid',
                        type: 'text',
                        placeholder: 'Enter Account SID',
                        popover: [
                            '<b>How to get the Account SID?</b>',
                            'Head to <b><a style="text-decoration:underline" href="https://login.twilio.com/u/signup?state=hKFo2SBaQktjdzI0ZHdKdm44QUc5YzBRXzlNMmlyTExkRWVTTaFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIHpwNUVrWDJzeFRJdUczVU5LTk16X0FHWEQ3dHU0S3hko2NpZNkgTW05M1lTTDVSclpmNzdobUlKZFI3QktZYjZPOXV1cks" target="_blank">Twilio</a> console -> Account info -> Account SID.</b>'
                        ]
                    },
                    {
                        label: 'Auth token',
                        name: 'authToken',
                        type: 'text',
                        placeholder: 'Enter Auth token',
                        popover: [
                            '<b>How to get the Auth token?</b>',
                            'Head to <b><a style="text-decoration:underline" href="https://login.twilio.com/u/signup?state=hKFo2SBaQktjdzI0ZHdKdm44QUc5YzBRXzlNMmlyTExkRWVTTaFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIHpwNUVrWDJzeFRJdUczVU5LTk16X0FHWEQ3dHU0S3hko2NpZNkgTW05M1lTTDVSclpmNzdobUlKZFI3QktZYjZPOXV1cks" target="_blank">Twilio</a> console -> Account info -> Auth Token.</b>'
                        ]
                    },
                    {
                        label: 'Sender number',
                        name: 'from',
                        type: 'phone',
                        placeholder: 'Enter phone',
                        popover: [
                            '<b>How to get sender number?</b>',
                            'Head to <b><a style="text-decoration:underline" href="https://login.twilio.com/u/signup?state=hKFo2SBaQktjdzI0ZHdKdm44QUc5YzBRXzlNMmlyTExkRWVTTaFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIHpwNUVrWDJzeFRJdUczVU5LTk16X0FHWEQ3dHU0S3hko2NpZNkgTW05M1lTTDVSclpmNzdobUlKZFI3QktZYjZPOXV1cks" target="_blank">Twilio</a> console -> Account info -> My Twilio phone number.</b>',
                            'If you have multiple <a style="text-decoration:underline" href="https://login.twilio.com/u/signup?state=hKFo2SBaQktjdzI0ZHdKdm44QUc5YzBRXzlNMmlyTExkRWVTTaFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIHpwNUVrWDJzeFRJdUczVU5LTk16X0FHWEQ3dHU0S3hko2NpZNkgTW05M1lTTDVSclpmNzdobUlKZFI3QktZYjZPOXV1cks" target="_blank">Twilio</a> phone numbers, you can select one as the default number.'
                        ]
                    }
                ]
            },
            [Providers.Msg91]: {
                imageIcon: 'msg91',
                title: 'MSG91',
                link: 'https://control.msg91.com/signin/',
                description: '',
                configure: [
                    {
                        label: 'Auth key',
                        name: 'authKey',
                        type: 'text',
                        placeholder: 'Enter auth key',
                        popover: [
                            '<b>How to get the Auth key?</b>',
                            'Create an account in <a style="text-decoration:underline" href="https://control.msg91.com/signin/" target="_blank">MSG91</a>.',
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
                            'Head to <b><a style="text-decoration:underline" href="https://control.msg91.com/signin/" target="_blank">MSG91</a> dashboard -> SMS -> Sender ID -> Create sender ID.</b>'
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
            [Providers.Telesign]: {
                imageIcon: 'telesign',
                title: 'Telesign',
                link: 'https://www.telesign.com/',
                description: '',
                configure: [
                    {
                        label: 'Username',
                        name: 'username',
                        type: 'text',
                        placeholder: 'Enter username'
                    },
                    {
                        label: 'Password',
                        name: 'password',
                        type: 'password',
                        placeholder: 'Enter password'
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
                title: 'TextMagic', 
                link: 'https://app.textmagic.com/login',
                description: '',
                configure: [
                    {
                        label: 'API key',
                        name: 'apiKey',
                        type: 'text',
                        placeholder: 'Enter API key',
                        popover: [
                            '<b>How to get the API key?</b>',
                            'Create an account in <a style="text-decoration:underline" href="https://app.textmagic.com/login" target="_blank">TextMagic</a>.',
                            'Head to <b><a style="text-decoration:underline" href="https://app.textmagic.com/login" target="_blank">TextMagic</a> dashboard -> API Settings -> Add new API key.</b>'
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
                link: 'https://www.vonage.com/?bypassgeoloc=true',
                description: '',
                configure: [
                    {
                        label: 'API key',
                        name: 'apiKey',
                        type: 'text',
                        placeholder: 'Enter API key',
                        popover: [
                            '<b>How to get the API key?</b>',
                            'Create an account in Vonage.',
                            'Head to <b><a style="text-decoration:underline" href="https://www.vonage.com/?bypassgeoloc=true" blank="_target">Vonage</a> dashboard and copy the API key.</b>'
                        ]
                    },
                    {
                        label: 'API secret',
                        name: 'apiSecret',
                        type: 'text',
                        placeholder: 'Enter API secret',
                        popover: [
                            '<b>How to get the API secret?</b>',
                            'Head to <b><a style="text-decoration:underline" href="https://www.vonage.com/?bypassgeoloc=true" target="_blank">Vonage</a> dashboard and copy the API secret.</b>'
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
