<script lang="ts">
    import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';

    let {
        show = true
    }: {
        show?: boolean;
    } = $props();
</script>

{#if show && !$isSmallViewport}
    <div class="suggestions-wrapper">
        <div class="popover-content">
            <Layout.Stack inline gap="xs" direction="row" alignItems="center">
                <Typography.Caption variant="400" color="--fgcolor-neutral-secondary">
                    Press
                </Typography.Caption>

                <Layout.Stack direction="row" inline gap="xxxs" style="height: fit-content">
                    <Badge content="⌘" variant="secondary" size="xs" />

                    <Badge content="A" variant="secondary" size="xs" />
                </Layout.Stack>

                <Typography.Caption variant="400" color="--fgcolor-neutral-secondary">
                    for suggestions
                </Typography.Caption>
            </Layout.Stack>
        </div>
    </div>
{/if}

<style lang="scss">
    .suggestions-wrapper {
        top: 15%;
        z-index: 50;
        position: absolute;
        pointer-events: none;
        transform: translateX(40%);

        @media (max-width: 768px) {
            top: auto;
            bottom: var(--space-12);
        }
    }

    .popover-content {
        height: 44px;
        width: max-content;
        gap: var(--gap-xxs);
        align-items: center;
        display: inline-flex;
        justify-content: center;
        padding: var(--space-5);
        border-radius: var(--border-radius-m);
        background: var(--bgcolor-neutral-primary);
        border: var(--border-width-s) solid var(--border-neutral);
        box-shadow:
            0 1px 3px 0 rgba(0, 0, 0, 0.03),
            0 4px 4px 0 rgba(0, 0, 0, 0.04);
    }
</style>
