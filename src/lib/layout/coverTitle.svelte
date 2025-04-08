<script lang="ts">
    import { isSmallViewport } from '$lib/stores/viewport';
    import { IconChevronLeft } from '@appwrite.io/pink-icons-svelte';
    import { Typography, Button, Icon } from '@appwrite.io/pink-svelte';
    import { isStudio } from '$lib/system';

    export let href: string = null;
</script>

{#if href && !isStudio}
    <span style:position="absolute" style:left="-2.75rem">
        <Button.Anchor size="s" icon variant="text" {href} aria-label="page back">
            <Icon icon={IconChevronLeft} />
        </Button.Anchor>
    </span>
{/if}
<Typography.Title truncate color="--fgcolor-neutral-primary" size={$isSmallViewport ? 'm' : 'l'}>
    <slot />
</Typography.Title>
