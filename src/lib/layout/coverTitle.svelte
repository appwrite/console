<script lang="ts">
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';
    import { IconChevronLeft } from '@appwrite.io/pink-icons-svelte';
    import { isSmallViewport, isTabletViewport } from '$lib/stores/viewport';
    import { Typography, Button, Icon, Layout } from '@appwrite.io/pink-svelte';

    let {
        href = null,
        children = null,
        backOnlyDesktop = false,
        ...restProps
    }: {
        href?: string | null;
        children?: Snippet;
        backOnlyDesktop?: boolean;
    } & HTMLAttributes<HTMLDivElement> = $props();
</script>

<Layout.Stack
    inline
    gap="xs"
    direction="row"
    alignItems="center"
    justifyContent="center"
    style={backOnlyDesktop && $isTabletViewport ? 'margin-inline-start: -2.5rem;' : ''}
    {...restProps}>
    {#if href}
        <span style:position="relative">
            <Button.Anchor
                {href}
                icon
                size="s"
                variant="text"
                aria-label="page back"
                disabled={backOnlyDesktop && $isTabletViewport}
                style={backOnlyDesktop && $isTabletViewport ? 'visibility: hidden' : ''}>
                <Icon icon={IconChevronLeft} />
            </Button.Anchor>
        </span>
    {/if}

    <Typography.Title
        truncate
        color="--fgcolor-neutral-primary"
        size={$isSmallViewport ? 'm' : 'l'}>
        {@render children?.()}
    </Typography.Title>
</Layout.Stack>
