<script lang="ts">
    import { Badge, FloatingActionBar, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';

    let {
        show = true,
        onMobileClick,
        showMock = false
    }: {
        show?: boolean;
        onMobileClick: () => Promise<void> | void;
        showMock?: boolean;
    } = $props();

    const suffix = $derived(
        showMock ? 'to get started with example suggestions' : 'for suggestions'
    );
    const translateX = $derived(showMock ? '25%' : '40%');
</script>

{#if show}
    {#if $isSmallViewport}
        <button type="button" class="floating-action-bar" onclick={onMobileClick}>
            <FloatingActionBar>
                <svelte:fragment slot="start">
                    <Typography.Text variant="m-500">Tap to apply suggestions</Typography.Text>
                </svelte:fragment>
            </FloatingActionBar>
        </button>
    {:else}
        <div class="suggestions-wrapper" style:transform={`translateX(${translateX})`}>
            <div class="popover-content">
                <Layout.Stack inline gap="xs" direction="row" alignContent="center">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-secondary">
                        Press
                    </Typography.Caption>

                    <Layout.Stack direction="row" inline gap="xxxs" style="height: fit-content">
                        <Badge content="⌘" variant="secondary" size="xs" />
                        <Badge content="A" variant="secondary" size="xs" />
                    </Layout.Stack>

                    <Typography.Caption variant="400" color="--fgcolor-neutral-secondary">
                        {suffix}
                    </Typography.Caption>
                </Layout.Stack>
            </div>
        </div>
    {/if}
{/if}

<style lang="scss">
    .suggestions-wrapper {
        top: 15%;
        z-index: 50;
        position: absolute;
        pointer-events: none;
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

    .floating-action-bar {
        left: 50%;
        bottom: 5%;
        width: 100%;
        max-width: 320px;
        position: fixed;
        transform: translateX(-50%);

        & > :global:first-child {
            display: unset; /* stack with flex-start in FAB */

            & > :global:first-child {
                width: 100%;
                justify-content: center;
            }
        }
    }
</style>
