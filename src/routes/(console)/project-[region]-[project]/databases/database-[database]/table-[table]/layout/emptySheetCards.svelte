<script lang="ts">
    import { Card } from '$lib/components';
    import type { ComponentType } from 'svelte';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

    let {
        icon,
        title,
        subtitle,
        onClick,
        href,
        disabled
    }: {
        icon?: ComponentType;
        title: string;
        subtitle?: string;
        onClick?: () => Promise<void> | void;
        href?: string;
        disabled?: boolean;
    } = $props();
</script>

<Card
    {href}
    {disabled}
    external
    radius="m"
    padding="xs"
    variant="primary"
    isButton={!href}
    on:click={() => onClick?.()}>
    <Layout.Stack direction="row" gap="m">
        {#if icon}
            <Icon {icon} size="m" color="--fgcolor-neutral-tertiary" />
        {/if}

        <Layout.Stack direction="column" gap="none">
            <Typography.Text variant="m-500" color="--fgcolor-neutral-primary">
                {title}
            </Typography.Text>
            {#if subtitle}
                <Typography.Text color="--fgcolor-neutral-secondary">
                    {subtitle}
                </Typography.Text>
            {/if}
        </Layout.Stack>
    </Layout.Stack>
</Card>
