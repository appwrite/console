<script lang="ts">
    import { isSmallViewport, isTabletViewport } from '$lib/stores/viewport';
    import { IconChevronLeft } from '@appwrite.io/pink-icons-svelte';
    import { Typography, Button, Icon, Layout } from '@appwrite.io/pink-svelte';

    export let href: string = null;
</script>

<Layout.Stack justifyContent="center" alignItems="center" direction="row" gap="xs" inline>
    {#if href}
        <span
            style={$isTabletViewport ? 'position: relative' : 'position: absolute; left: -2.75rem'}>
            <Button.Anchor size="s" icon variant="text" {href} aria-label="page back">
                <Icon icon={IconChevronLeft} />
            </Button.Anchor>
        </span>
    {/if}
    <Typography.Title
        truncate
        color="--fgcolor-neutral-primary"
        size={$isSmallViewport ? 'm' : 'l'}>
        <slot />
    </Typography.Title>
</Layout.Stack>
