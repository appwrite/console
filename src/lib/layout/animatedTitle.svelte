<script lang="ts">
    import { isTabletViewport } from '$lib/stores/viewport';
    import { IconChevronLeft } from '@appwrite.io/pink-icons-svelte';
    import { Button, Icon, Layout } from '@appwrite.io/pink-svelte';
    import type { Snippet } from 'svelte';
    import type { HTMLAttributes } from 'svelte/elements';

    let {
        href = null,
        collapsed = false,
        children,
        ...restProps
    }: {
        href?: string | null;
        collapsed?: boolean;
        children?: Snippet;
    } & HTMLAttributes<HTMLDivElement> = $props();

    const buttonSize = $derived(collapsed ? 'xs' : 's');
    const currentFontSize = $derived(collapsed ? 'var(--font-size-l)' : 'var(--font-size-xxl)');
</script>

<Layout.Stack
    inline
    gap="xs"
    direction="row"
    alignItems="center"
    justifyContent="center"
    {...restProps}>
    {#if href}
        <span style:position="relative">
            <Button.Anchor
                {href}
                icon
                variant="text"
                size={buttonSize}
                aria-label="page back"
                disabled={$isTabletViewport}
                style={$isTabletViewport ? 'visibility: hidden' : ''}>
                <Icon icon={IconChevronLeft} />
            </Button.Anchor>
        </span>
    {/if}
    <h1 class="animated-title" style:font-size={currentFontSize}>
        {@render children?.()}
    </h1>
</Layout.Stack>

<style lang="scss">
    .animated-title {
        font-family: var(--font-family-brand), var(--sans-fallbacks);
        font-weight: 400;
        color: var(--fgcolor-neutral-primary);
        text-align: start;
        margin: 0;

        transition:
            font-size 300ms cubic-bezier(0.4, 0, 0.2, 1),
            line-height 300ms cubic-bezier(0.4, 0, 0.2, 1),
            letter-spacing 300ms cubic-bezier(0.4, 0, 0.2, 1);

        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
        line-height: 130%;
    }
</style>
