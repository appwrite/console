<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { MessagingProviderType } from '@appwrite.io/console';

    export let type: MessagingProviderType | Models.Provider['type'];
    export let noIcon = false;
    export let size: 's' | 'm' | 'l' = 'm';

    let icon = '';
    let text = '';

    switch (type) {
        case MessagingProviderType.Email:
            icon = 'icon-mail';
            text = 'Email';
            break;
        case MessagingProviderType.Sms:
            icon = 'icon-annotation';
            text = 'SMS';
            break;
        case MessagingProviderType.Push:
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
