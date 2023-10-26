import { writable } from 'svelte/store';
import type { Column } from '$lib/helpers/types';
import { Providers } from '../provider.svelte';
import { ProviderTypes } from '../providerType.svelte';

export let showCreate = writable(false);

export const columns = writable<Column[]>([
    { id: '$id', title: 'Provider ID', type: 'string', show: true },
    { id: 'name', title: 'Name', type: 'string', show: true },
    { id: 'provider', title: 'Provider', type: 'string', show: true },
    { id: 'type', title: 'Type', type: 'string', show: true },
    { id: 'enabled', title: 'Status', type: 'boolean', show: true }
]);

type ProvidersMap = {
    [key in ProviderTypes]: {
        name: string;
        text: string;
        icon: string;
        providers: {
            [key in Providers]?: {
                imageIcon: string;
                title: string;
                description: string;
                configure: {
                    label: string;
                    name: string;
                    type: 'text' | 'phone' | 'email' | 'domain' | 'file' | 'switch';
                    placeholder?: string;
                    description?: string;
                    popover?: string[];
                    allowedFileExtensions?: string[];
                }[];
            };
        };
    };
};

export const providers: ProvidersMap = {
    [ProviderTypes.Sms]: {
        name: 'SMS',
        text: 'SMS',
        icon: 'annotation',
        providers: {
            [Providers.Twilio]: {
                imageIcon: 'twilio',
                title: 'Twilio',
                description: '',
                configure: [
                    {
                        label: 'Account SID',
                        name: 'accountSid',
                        type: 'text',
                        placeholder: 'Enter Account SID',
                        popover: [
                            '<b>How to get the Account SID?</b>',
                            'Head to <b>Twilio console -> Account info -> Account SID.</b>'
                        ]
                    },
                    {
                        label: 'Auth token',
                        name: 'authToken',
                        type: 'text',
                        placeholder: 'Enter Auth token',
                        popover: [
                            '<b>How to get the Auth token?</b>',
                            'Head to <b>Twilio console -> Account info -> Auth Token.</b>'
                        ]
                    },
                    {
                        label: 'Sender number',
                        name: 'from',
                        type: 'phone',
                        placeholder: 'Enter phone',
                        popover: [
                            '<b>How to get sender number?</b>',
                            'Head to <b>Twilio console -> Account info -> My Twilio phone number.</b>',
                            'If you have multiple Twilio phone numbers, you can select one as the default number.'
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
                        type: 'text',
                        placeholder: 'Enter auth key',
                        popover: [
                            '<b>How to get the Auth key?</b>',
                            'Create an account in MSG91.',
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
                            'Head to <b>MSG91 dashboard -> SMS -> Sender ID -> Create sender ID.</b>'
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
                        type: 'text',
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
                title: 'Textmagic',
                description: '',
                configure: [
                    {
                        label: 'API key',
                        name: 'apiKey',
                        type: 'text',
                        placeholder: 'Enter API key',
                        popover: [
                            '<b>How to get the API key?</b>',
                            'Create an account in Textmagic.',
                            'Head to <b>TextMagic dashboard -> API Settings -> Add new API key.</b>'
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
                        type: 'text',
                        placeholder: 'Enter API key',
                        popover: [
                            '<b>How to get the API key?</b>',
                            'Create an account in Vonage.',
                            'Head to <b>Vonage dashboard and copy the API key.</b>'
                        ]
                    },
                    {
                        label: 'API secret',
                        name: 'apiSecret',
                        type: 'text',
                        placeholder: 'Enter API secret',
                        popover: [
                            '<b>How to get the API secret?</b>',
                            'Head to <b>Vonage dashboard and copy the API secret.</b>'
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
    },
    [ProviderTypes.Email]: {
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
                        type: 'text',
                        placeholder: 'Enter API key',
                        popover: [
                            '<b>How to get the API key?</b>',
                            'Create an account in Mailgun.',
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
                            'Follow <b>Mailgun instructions</b> to verify the domain name.'
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
                        name: 'from',
                        type: 'email',
                        placeholder: 'Enter email'
                    }
                ]
            },
            [Providers.Sendgrid]: {
                imageIcon: 'sendgrid',
                title: 'Sendgrid',
                description: '',
                configure: [
                    {
                        label: 'API key',
                        name: 'apiKey',
                        type: 'text',
                        placeholder: 'Enter API key',
                        popover: [
                            '<b>How to get the API key?</b>',
                            'Create an account in Mailgun.',
                            'Head to <b>Profile -> API Security -> Add new key.</b>'
                        ]
                    },
                    {
                        label: 'Sender email',
                        name: 'from',
                        type: 'email',
                        placeholder: 'Enter email'
                    }
                ]
            }
        }
    },
    [ProviderTypes.Push]: {
        name: 'Push notification',
        text: 'notifications',
        icon: 'device-mobile',
        providers: {
            [Providers.FCM]: {
                imageIcon: 'firebase',
                title: 'FCM',
                description: 'Firebase Cloud Messaging',
                configure: [
                    {
                        label: 'Server key (.json file)',
                        name: 'serverKey',
                        type: 'file',
                        allowedFileExtensions: ['json'],
                        placeholder: 'Enter server key',
                        popover: [
                            '<b>How to get the FCM server key?</b>',
                            'Head to <b>Project settings -> Service accounts -> Generate new private key.</b>',
                            'Generating the new key will result in the download of a JSON file.'
                        ]
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
                            'Head to <b>Apple Developer Member Center -> Membership details -> Team ID.</b>'
                        ]
                    },
                    {
                        label: 'Bundle ID',
                        name: 'bundleId',
                        type: 'text',
                        placeholder: 'Enter bundle ID',
                        popover: [
                            '<b>How to get the bundle ID?</b>',
                            'Head to <b>Apple Developer Member Center -> Certificates, Identifiers & Profiles -> Identifiers.</b>',
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
                            'Head to <b>Apple Developer Member Center -> Certificates, Identifiers & Profiles -> Keys.</b>',
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
                            'Head to <b>Apple Developer Member Center</b> (under Program resources) <b>-> Certificates, Identifiers & Profiles -> Keys.</b>',
                            'Create a key and give it a name. Enable the Apple Push Notifications service (APNS), and register your key.'
                        ]
                    }
                ]
            }
            // [Providers.MQTT]: {
            //     imageIcon: 'mqtt',
            //     title: 'MQTT',
            //     description: 'Message Queuing Telemtry Transport'
            // }
        }
    }
};
