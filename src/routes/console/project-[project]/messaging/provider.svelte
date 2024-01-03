<script context="module" lang="ts">
    export enum Providers {
        Twilio = 'twilio',
        Msg91 = 'msg91',
        Telesign = 'telesign',
        Textmagic = 'textmagic',
        Vonage = 'vonage',
        Mailgun = 'mailgun',
        Sendgrid = 'sendgrid',
        FCM = 'fcm',
        APNS = 'apns',
        MQTT = 'mqtt'
    }
</script>

<script lang="ts">
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';

    export let provider: Providers;
    export let name: string = '';
    export let noIcon = false;
    export let size: 's' | 'm' | 'l' = 'm';

    let icon = '';
    let displayName = name || provider.charAt(0).toUpperCase() + provider.slice(1);

    let textSize = '1.25rem';
    switch (size) {
        case 's':
            textSize = '1rem';
            break;
        case 'l':
            textSize = '1.5rem';
            break;
    }

    switch (provider) {
        case Providers.FCM:
            icon = 'firebase';
            displayName = name || 'FCM';
            break;
        case Providers.APNS:
            icon = 'apple';
            displayName = name || 'APNS';
            break;
        case Providers.MQTT:
            icon = 'mqtt';
            displayName = name || 'MQTT';
            break;
        case Providers.Sendgrid:
            icon = 'sendgrid';
            break;
        case Providers.Mailgun:
            icon = 'mailgun';
            break;
        case Providers.Twilio:
            icon = 'twilio';
            break;
        case Providers.Telesign:
            icon = 'telesign';
            break;
        case Providers.Msg91:
            icon = 'msg91';
            displayName = name || 'MSG91';
            break;
        case Providers.Textmagic:
            icon = 'textmagic';
            displayName = name || 'TextMagic';
            break;
        case Providers.Vonage:
            icon = 'vonage';
            break;
    }
</script>

{#if icon === ''}
    Invalid provider
{:else}
    <div class="u-inline-flex u-cross-center u-gap-8">
        {#if !noIcon}
            <div
                class="avatar"
                class:is-size-large={size === 'l'}
                class:is-size-small={size === 's'}>
                <img
                    style:--p-text-size={textSize}
                    src={`${base}/icons/${$app.themeInUse}/color/${icon}.svg`}
                    alt={displayName} />
            </div>
        {/if}
        <slot>
            {displayName}
        </slot>
    </div>
{/if}
