<script lang="ts">
    import { Container } from '$lib/layout';
    import DangerZone from './dangerZone.svelte';
    import UpdateName from './updateName.svelte';
    import UpdateSettings from './updateSettings.svelte';
    import UpdateStatus from './updateStatus.svelte';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { MessagingProviderType } from '@appwrite.io/console';
    import { Providers } from '../../provider.svelte';
    import { providers } from '../store';
    import { provider as providerData } from './store';

    let providerType: MessagingProviderType;
    if (isValueOfStringEnum(MessagingProviderType, $providerData.type)) {
        providerType = $providerData.type;
    }

    let provider: Providers;
    if (isValueOfStringEnum(Providers, $providerData.provider)) {
        provider = $providerData.provider;
    }

    let params: object = {};

    $: switch (provider) {
        case Providers.Twilio:
            params = {
                providerId: $providerData.$id,
                name: $providerData.name,
                enabled: $providerData.enabled,
                accountSid: $providerData.credentials['accountSid'],
                authToken: $providerData.credentials['authToken'],
                from: $providerData.options['from']
            };
            break;
        case Providers.Msg91:
            params = {
                providerId: $providerData.$id,
                name: $providerData.name,
                enabled: $providerData.enabled,
                templateId: $providerData.credentials['templateId'],
                senderId: $providerData.credentials['senderId'],
                authKey: $providerData.credentials['authKey']
            };
            break;
        case Providers.Telesign:
            params = {
                providerId: $providerData.$id,
                name: $providerData.name,
                enabled: $providerData.enabled,
                customerId: $providerData.credentials['customerId'],
                apiKey: $providerData.credentials['apiKey'],
                from: $providerData.options['from']
            };
            break;
        case Providers.Textmagic:
            params = {
                providerId: $providerData.$id,
                name: $providerData.name,
                enabled: $providerData.enabled,
                username: $providerData.credentials['username'],
                apiKey: $providerData.credentials['apiKey'],
                from: $providerData.options['from']
            };
            break;
        case Providers.Vonage:
            params = {
                providerId: $providerData.$id,
                name: $providerData.name,
                enabled: $providerData.enabled,
                apiKey: $providerData.credentials['apiKey'],
                apiSecret: $providerData.credentials['apiSecret'],
                from: $providerData.options['from']
            };
            break;
        case Providers.Mailgun:
            params = {
                providerId: $providerData.$id,
                name: $providerData.name,
                enabled: $providerData.enabled,
                isEuRegion: $providerData.credentials['isEuRegion'],
                fromEmail: $providerData.options['fromEmail'],
                fromName: $providerData.options['fromName'],
                replyToEmail: $providerData.options['replyToEmail'],
                replyToName: $providerData.options['replyToName'],
                apiKey: $providerData.credentials['apiKey'],
                domain: $providerData.credentials['domain']
            };
            break;
        case Providers.Sendgrid:
            params = {
                providerId: $providerData.$id,
                name: $providerData.name,
                enabled: $providerData.enabled,
                apiKey: $providerData.credentials['apiKey'],
                fromEmail: $providerData.options['fromEmail'],
                fromName: $providerData.options['fromName'],
                replyToEmail: $providerData.options['replyToEmail'],
                replyToName: $providerData.options['replyToName']
            };
            break;
        case Providers.SMTP:
            params = {
                providerId: $providerData.$id,
                name: $providerData.name,
                enabled: $providerData.enabled,
                host: $providerData.credentials['host'],
                port: $providerData.credentials['port'],
                username: $providerData.credentials['username'],
                password: $providerData.credentials['password'],
                fromName: $providerData.options['fromName'],
                fromEmail: $providerData.options['fromEmail'],
                replyToName: $providerData.options['replyToName'],
                replyToEmail: $providerData.options['replyToEmail'],
                encryption: !$providerData.options['encryption']
                    ? 'none'
                    : $providerData.options['encryption'],
                autoTLS: $providerData.options['autoTLS'],
                mailer: $providerData.options['mailer']
            };
            break;
        case Providers.FCM:
            params = {
                providerId: $providerData.$id,
                name: $providerData.name,
                enabled: $providerData.enabled
            };
            if ('serviceAccountJSON' in $providerData.credentials) {
                const serviceAccountJSON = $providerData.credentials['serviceAccountJSON'];
                if (typeof serviceAccountJSON === 'string') {
                    params['serviceAccountJSON'] = serviceAccountJSON;
                } else if (serviceAccountJSON instanceof Object) {
                    params['serviceAccountJSON'] = JSON.stringify(serviceAccountJSON);
                }
            }
            break;
        case Providers.APNS:
            params = {
                providerId: $providerData.$id,
                name: $providerData.name,
                enabled: $providerData.enabled,
                authKey: $providerData.credentials['authKey'],
                authKeyId: $providerData.credentials['authKeyId'],
                teamId: $providerData.credentials['teamId'],
                bundleId: $providerData.credentials['bundleId'],
                sandbox: $providerData.options['sandbox']
            };
            break;
    }
</script>

<Container>
    <UpdateStatus />
    <UpdateName />
    <UpdateSettings
        inputs={providers[providerType].providers[provider].configure}
        providerId={$providerData.$id}
        {providerType}
        {provider}
        {params} />
    <DangerZone />
</Container>
