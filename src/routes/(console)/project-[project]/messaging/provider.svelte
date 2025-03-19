<script context="module" lang="ts">
    export enum Providers {
        Twilio = 'twilio',
        Msg91 = 'msg91',
        Telesign = 'telesign',
        Textmagic = 'textmagic',
        Vonage = 'vonage',
        Mailgun = 'mailgun',
        Sendgrid = 'sendgrid',
        SMTP = 'smtp',
        FCM = 'fcm',
        APNS = 'apns'
    }

    export function getProviderDisplayNameAndIcon(provider: Providers | string) {
        let icon = '';
        let displayName = provider.charAt(0).toUpperCase() + provider.slice(1);

        switch (provider) {
            case Providers.FCM:
                icon = 'firebase';
                displayName = 'FCM';
                break;
            case Providers.APNS:
                icon = 'apple';
                displayName = 'APNS';
                break;
            case Providers.Sendgrid:
                icon = 'sendgrid';
                break;
            case Providers.Mailgun:
                icon = 'mailgun';
                break;
            case Providers.SMTP:
                icon = 'smtp';
                displayName = 'SMTP';
                break;
            case Providers.Twilio:
                icon = 'twilio';
                break;
            case Providers.Telesign:
                icon = 'telesign';
                break;
            case Providers.Msg91:
                icon = 'msg91';
                displayName = 'MSG91';
                break;
            case Providers.Textmagic:
                icon = 'textmagic';
                displayName = 'Textmagic';
                break;
            case Providers.Vonage:
                icon = 'vonage';
                break;
        }
        return { icon, displayName };
    }
</script>

<script lang="ts">
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { IconMail } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';

    export let provider: Providers | string;
    export let name: string = '';
    export let noIcon = false;

    const { icon, displayName } = getProviderDisplayNameAndIcon(provider);
</script>

{#if icon === ''}
    Invalid provider
{:else}
    <Layout.Stack direction="row" alignItems="center">
        {#if !noIcon}
            {#if provider === Providers.SMTP}
                <Icon icon={IconMail} />
            {:else}
                <img src={`${base}/icons/${$app.themeInUse}/color/${icon}.svg`} alt={provider} />
            {/if}
        {/if}
        <slot>
            {name || displayName}
        </slot>
    </Layout.Stack>
{/if}
