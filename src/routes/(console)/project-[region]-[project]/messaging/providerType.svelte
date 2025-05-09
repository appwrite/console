<script lang="ts">
    import type { Models } from '@appwrite.io/console';
    import { MessagingProviderType } from '@appwrite.io/console';
    import { IconAnnotation, IconDeviceMobile, IconMail } from '@appwrite.io/pink-icons-svelte';
    import { Avatar, Icon, Layout } from '@appwrite.io/pink-svelte';
    import type { ComponentType } from 'svelte';
    import { getProviderText } from './helper';

    export let type: MessagingProviderType | Models.Provider['type'];
    export let noIcon = false;
    export let size: 'xs' | 's' | 'm' | 'l' = 'm';

    const text = getProviderText(type);
    let icon: ComponentType;

    switch (type) {
        case MessagingProviderType.Email:
            icon = IconMail;
            break;
        case MessagingProviderType.Sms:
            icon = IconAnnotation;
            break;
        case MessagingProviderType.Push:
            icon = IconDeviceMobile;
            break;
    }
</script>

{#if text === ''}
    Invalid provider type
{:else}
    <Layout.Stack inline direction="row" alignItems="center">
        {#if !noIcon}
            <Avatar {size}>
                <Icon {icon} size="s" />
            </Avatar>
        {/if}
        <slot {text}>
            {text}
        </slot>
    </Layout.Stack>
{/if}
