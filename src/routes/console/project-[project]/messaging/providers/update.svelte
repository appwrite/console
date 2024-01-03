<script lang="ts">
    import { onDestroy } from 'svelte';
    import { Wizard } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Configure from './wizard/configure.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { project } from '../../store';
    import { wizard } from '$lib/stores/wizard';
    import { provider, providerParams } from './wizard/store';
    import { Providers } from '../provider.svelte';
    import { Dependencies } from '$lib/constants';

    async function update() {
        try {
            let response = { $id: '', name: '' };
            const providerId = $providerParams[$provider].providerId;
            switch ($provider) {
                case Providers.Twilio:
                    response = await sdk.forProject.client.call(
                        'PATCH',
                        new URL(
                            `${sdk.forProject.client.config.endpoint}/messaging/providers/twilio/${providerId}`
                        ),
                        {
                            'X-Appwrite-Project': sdk.forProject.client.config.project,
                            'content-type': 'application/json',
                            'X-Appwrite-Mode': 'admin'
                        },
                        {
                            providerId: providerId,
                            name: $providerParams[$provider].name,
                            default: $providerParams[$provider].default,
                            enabled: $providerParams[$provider].enabled,
                            accountSid: $providerParams[$provider].accountSid,
                            authToken: $providerParams[$provider].authToken,
                            from: $providerParams[$provider].from
                        }
                    );
                    break;
                case Providers.Msg91:
                    response = await sdk.forProject.client.call(
                        'PATCH',
                        new URL(
                            `${sdk.forProject.client.config.endpoint}/messaging/providers/msg91/${providerId}`
                        ),
                        {
                            'X-Appwrite-Project': sdk.forProject.client.config.project,
                            'content-type': 'application/json',
                            'X-Appwrite-Mode': 'admin'
                        },
                        {
                            providerId: providerId,
                            name: $providerParams[$provider].name,
                            default: $providerParams[$provider].default,
                            enabled: $providerParams[$provider].enabled,
                            from: $providerParams[$provider].from,
                            senderId: $providerParams[$provider].senderId,
                            authKey: $providerParams[$provider].authKey
                        }
                    );
                    break;
                case Providers.Telesign:
                    response = await sdk.forProject.client.call(
                        'PATCH',
                        new URL(
                            `${sdk.forProject.client.config.endpoint}/messaging/providers/telesign/${providerId}`
                        ),
                        {
                            'X-Appwrite-Project': sdk.forProject.client.config.project,
                            'content-type': 'application/json',
                            'X-Appwrite-Mode': 'admin'
                        },
                        {
                            providerId: providerId,
                            name: $providerParams[$provider].name,
                            default: $providerParams[$provider].default,
                            enabled: $providerParams[$provider].enabled,
                            from: $providerParams[$provider].from,
                            username: $providerParams[$provider].username,
                            password: $providerParams[$provider].password
                        }
                    );
                    break;
                case Providers.Textmagic:
                    response = await sdk.forProject.client.call(
                        'PATCH',
                        new URL(
                            `${sdk.forProject.client.config.endpoint}/messaging/providers/textmagic/${providerId}`
                        ),
                        {
                            'X-Appwrite-Project': sdk.forProject.client.config.project,
                            'content-type': 'application/json',
                            'X-Appwrite-Mode': 'admin'
                        },
                        {
                            providerId: providerId,
                            name: $providerParams[$provider].name,
                            default: $providerParams[$provider].default,
                            enabled: $providerParams[$provider].enabled,
                            from: $providerParams[$provider].from,
                            username: $providerParams[$provider].username,
                            apiKey: $providerParams[$provider].apiKey
                        }
                    );
                    break;
                case Providers.Vonage:
                    response = await sdk.forProject.client.call(
                        'PATCH',
                        new URL(
                            `${sdk.forProject.client.config.endpoint}/messaging/providers/vonage/${providerId}`
                        ),
                        {
                            'X-Appwrite-Project': sdk.forProject.client.config.project,
                            'content-type': 'application/json',
                            'X-Appwrite-Mode': 'admin'
                        },
                        {
                            providerId: providerId,
                            name: $providerParams[$provider].name,
                            default: $providerParams[$provider].default,
                            enabled: $providerParams[$provider].enabled,
                            from: $providerParams[$provider].from,
                            apiKey: $providerParams[$provider].apiKey,
                            apiSecret: $providerParams[$provider].apiSecret
                        }
                    );
                    break;
                case Providers.Mailgun:
                    response = await sdk.forProject.client.call(
                        'PATCH',
                        new URL(
                            `${sdk.forProject.client.config.endpoint}/messaging/providers/mailgun/${providerId}`
                        ),
                        {
                            'X-Appwrite-Project': sdk.forProject.client.config.project,
                            'content-type': 'application/json',
                            'X-Appwrite-Mode': 'admin'
                        },
                        {
                            providerId: providerId,
                            name: $providerParams[$provider].name,
                            default: $providerParams[$provider].default,
                            enabled: $providerParams[$provider].enabled,
                            isEuRegion: $providerParams[$provider].isEuRegion,
                            from: $providerParams[$provider].from,
                            apiKey: $providerParams[$provider].apiKey,
                            domain: $providerParams[$provider].domain
                        }
                    );
                    break;
                case Providers.Sendgrid:
                    response = await sdk.forProject.client.call(
                        'PATCH',
                        new URL(
                            `${sdk.forProject.client.config.endpoint}/messaging/providers/sendgrid/${providerId}`
                        ),
                        {
                            'X-Appwrite-Project': sdk.forProject.client.config.project,
                            'content-type': 'application/json',
                            'X-Appwrite-Mode': 'admin'
                        },
                        {
                            providerId: providerId,
                            name: $providerParams[$provider].name,
                            default: $providerParams[$provider].default,
                            enabled: $providerParams[$provider].enabled,
                            from: $providerParams[$provider].from,
                            apiKey: $providerParams[$provider].apiKey
                        }
                    );
                    break;
                case Providers.FCM:
                    response = await sdk.forProject.client.call(
                        'PATCH',
                        new URL(
                            `${sdk.forProject.client.config.endpoint}/messaging/providers/fcm')/${providerId}`
                        ),
                        {
                            'X-Appwrite-Project': sdk.forProject.client.config.project,
                            'content-type': 'application/json',
                            'X-Appwrite-Mode': 'admin'
                        },
                        {
                            providerId: providerId,
                            name: $providerParams[$provider].name,
                            default: $providerParams[$provider].default,
                            enabled: $providerParams[$provider].enabled,
                            serverKey: $providerParams[$provider].serverKey
                        }
                    );
                    break;
                case Providers.APNS:
                    response = await sdk.forProject.client.call(
                        'PATCH',
                        new URL(
                            `${sdk.forProject.client.config.endpoint}/messaging/providers/apns/${providerId}`
                        ),
                        {
                            'X-Appwrite-Project': sdk.forProject.client.config.project,
                            'content-type': 'application/json',
                            'X-Appwrite-Mode': 'admin'
                        },
                        {
                            providerId: providerId,
                            name: $providerParams[$provider].name,
                            default: $providerParams[$provider].default,
                            enabled: $providerParams[$provider].enabled,
                            authKey: $providerParams[$provider].authKey,
                            authKeyId: $providerParams[$provider].authKeyId,
                            teamId: $providerParams[$provider].teamId,
                            bundleId: $providerParams[$provider].bundleId
                        }
                    );
                    break;
                case Providers.MQTT:
                    response = await sdk.forProject.client.call(
                        'PATCH',
                        new URL(
                            `${sdk.forProject.client.config.endpoint}/messaging/providers/mqtt/${providerId}`
                        ),
                        {
                            'X-Appwrite-Project': sdk.forProject.client.config.project,
                            'content-type': 'application/json',
                            'X-Appwrite-Mode': 'admin'
                        },
                        {
                            providerId: providerId,
                            name: $providerParams[$provider].name,
                            default: $providerParams[$provider].default,
                            enabled: $providerParams[$provider].enabled,
                            serverKey: $providerParams[$provider].serverKey
                        }
                    );
                    break;
            }
            await invalidate(Dependencies.MESSAGING_PROVIDER);
            wizard.hide();
            addNotification({
                type: 'success',
                message: `${response.name} has been updated`
            });
            trackEvent(Submit.MessagingProviderUpdate, {
                provider: $provider
            });
            await goto(
                `${base}/console/project-${$project.$id}/messaging/providers/provider-${response.$id}`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingProviderUpdate);
        }
    }

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Configure',
        component: Configure
    });
</script>

<Wizard title="Update provider" steps={stepsComponents} on:finish={update} finalAction="Update" />
