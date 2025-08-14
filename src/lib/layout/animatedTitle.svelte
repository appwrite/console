<script lang="ts">
    import { isSmallViewport } from '$lib/stores/viewport';
    import { IconChevronLeft } from '@appwrite.io/pink-icons-svelte';
    import { Button, Icon, Layout } from '@appwrite.io/pink-svelte';
    import type { Snippet } from 'svelte';

    let {
        href = null,
        collapsed = false,
        children
    }: {
        href?: string | null;
        collapsed?: boolean;
        children: Snippet;
    } = $props();

    const buttonSize = $derived(collapsed ? 'xs' : 's');

    const expandedSize = $derived(
        $isSmallViewport ? 'var(--font-size-m)' : 'var(--font-size-xxxl)'
    );

    // const currentFontSize = $derived(collapsed ? 'var(--font-size-l)' : expandedSize);
    const currentFontSize = $derived(collapsed ? 'var(--font-size-l)' : 'var(--font-size-xxxl)');

    const currentLineHeight = $derived(collapsed ? '130%' : '140%');
    const currentLetterSpacing = $derived(collapsed ? '0' : '-0.144px');
</script>

<Layout.Stack justifyContent="center" alignItems="center" direction="row" gap="xs" inline>
    {#if href}
        <span style:position="relative">
            <Button.Anchor size={buttonSize} icon variant="text" {href} aria-label="page back">
                <Icon icon={IconChevronLeft} />
            </Button.Anchor>
        </span>
    {/if}
    <h1
        class="animated-title"
        style:font-size={currentFontSize}
        style:line-height={currentLineHeight}
        style:letter-spacing={currentLetterSpacing}>
        {@render children()}
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
    }
</style>
