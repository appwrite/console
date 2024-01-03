<script context="module" lang="ts">
    export enum ProviderTypes {
        Email = 'email',
        Sms = 'sms',
        Push = 'push'
    }
</script>

<script lang="ts">
    export let type: ProviderTypes;
    export let noIcon = false;
    export let size: 's' | 'm' | 'l' = 'm';

    let icon = '';
    let text = '';

    switch (type) {
        case ProviderTypes.Email:
            icon = 'icon-mail';
            text = 'Email';
            break;
        case ProviderTypes.Sms:
            icon = 'icon-annotation';
            text = 'SMS';
            break;
        case ProviderTypes.Push:
            icon = 'icon-device-mobile';
            text = 'Push';
            break;
    }

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

{#if text === ''}
    Invalid provider type
{:else}
    <div class="u-inline-flex u-cross-center u-gap-8">
        {#if !noIcon}
            <div
                class="avatar"
                class:is-size-large={size === 'l'}
                class:is-size-small={size === 's'}>
                <span class={icon} style:font-size={textSize} aria-hidden="true" />
            </div>
        {/if}
        <slot>
            {text}
        </slot>
    </div>
{/if}
