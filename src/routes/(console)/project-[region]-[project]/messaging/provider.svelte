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

    export let provider: Providers | string;
    export let name: string = '';
    export let noIcon = false;
    export let size: 's' | 'm' | 'l' = 'm';

    const { icon, displayName } = getProviderDisplayNameAndIcon(provider);

    let textSize = '1.25rem';
    switch (size) {
        case 's':
            textSize = '1rem';
            break;
        case 'l':
            textSize = '1.5rem';
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
                {#if provider === Providers.SMTP}
                    <span style:--p-text-size={textSize} class="icon-mail" />
                {:else}
                    <img
                        style:--p-text-size={textSize}
                        src={`${base}/icons/${$app.themeInUse}/color/${icon}.svg`}
                        alt={name || displayName} />
                {/if}
            </div>
        {/if}
        <slot>
            {name || displayName}
        </slot>
    </div>
{/if}
