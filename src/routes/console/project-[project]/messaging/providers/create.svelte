<script lang="ts">
    import { onDestroy } from 'svelte';
    import { Wizard } from '$lib/layout';
    import type { WizardStepsType } from '$lib/layout/wizard.svelte';
    import Provider from './wizard/provider.svelte';
    import Configure from './wizard/configure.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { project } from '../../store';
    import { wizard } from '$lib/stores/wizard';
    import { provider, providerParams } from './wizard/store';
    import { ID } from '@appwrite.io/console';
    import { Providers } from '../provider.svelte';

    async function create() {
        try {
            let response = { $id: '', name: '' };
            const providerId = $providerParams[$provider].providerId || ID.unique();
            switch ($provider) {
                case Providers.Twilio:
                    response = await sdk.forProject.client.call(
                        'POST',
                        new URL(
                            sdk.forProject.client.config.endpoint + '/messaging/providers/twilio'
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
                        'POST',
                        new URL(
                            sdk.forProject.client.config.endpoint + '/messaging/providers/msg91'
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
                        'POST',
                        new URL(
                            sdk.forProject.client.config.endpoint + '/messaging/providers/telesign'
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
                        'POST',
                        new URL(
                            sdk.forProject.client.config.endpoint + '/messaging/providers/textmagic'
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
                        'POST',
                        new URL(
                            sdk.forProject.client.config.endpoint + '/messaging/providers/vonage'
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
                        'POST',
                        new URL(
                            sdk.forProject.client.config.endpoint + '/messaging/providers/mailgun'
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
                        'POST',
                        new URL(
                            sdk.forProject.client.config.endpoint + '/messaging/providers/sendgrid'
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
                        'POST',
                        new URL(sdk.forProject.client.config.endpoint + '/messaging/providers/fcm'),
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
                        'POST',
                        new URL(
                            sdk.forProject.client.config.endpoint + '/messaging/providers/apns'
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
                        'POST',
                        new URL(
                            sdk.forProject.client.config.endpoint + '/messaging/providers/mqtt'
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
            wizard.hide();
            addNotification({
                type: 'success',
                message: `${response.name} has been created`
            });
            trackEvent(Submit.MessagingProviderCreate, {
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
            trackError(error, Submit.MessagingProviderCreate);
        }
    }

    onDestroy(() => {
        console.log('destroy');
    });

    const stepsComponents: WizardStepsType = new Map();
    stepsComponents.set(1, {
        label: 'Proivder',
        component: Provider
    });
    stepsComponents.set(2, {
        label: 'Configure',
        component: Configure
    });
</script>

<Wizard title="Create provider" steps={stepsComponents} on:finish={create} />
