<script lang="ts">
    import { IconChevronLeft } from '@appwrite.io/pink-icons-svelte';
    import { Typography, Button, Icon } from '@appwrite.io/pink-svelte';

    export let href: string = null;
</script>

<div>
    {#if href}
        <span style:position="absolute" style:left="-2.75rem">
            <Button.Anchor size="s" icon variant="text" {href} aria-label="page back">
                <Icon icon={IconChevronLeft} />
            </Button.Anchor>
        </span>
    {/if}
    <Typography.Title color="--color-fgcolor-neutral-primary" size="l"><slot /></Typography.Title>
</div>

<!-- <Heading size="4" tag="h1" trimmed={false}>
    <div class="u-flex u-cross-center">
        {#if href}
            <a class="button is-text is-only-icon" {href} aria-label="page back">
                <span class="icon-cheveron-left" aria-hidden="true" />
            </a>
        {/if}
        <span class="text u-trim-1" data-private>
            <slot />
        </span>
    </div>
</Heading> -->
