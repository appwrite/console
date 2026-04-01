<script lang="ts">
    import { Badge, FloatingActionBar, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import HintBadge from '../hintBadge.svelte';

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
            <HintBadge>
                <Layout.Stack inline gap="xs" direction="row" alignItems="center">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-secondary">
                        Press
                    </Typography.Caption>

                    <Layout.Stack
                        direction="row"
                        inline
                        gap="xxxs"
                        alignItems="center"
                        style="height: fit-content">
                        <Badge content="⌘" variant="secondary" size="xs" />
                        <Badge content="A" variant="secondary" size="xs" />
                    </Layout.Stack>

                    <Typography.Caption variant="400" color="--fgcolor-neutral-secondary">
                        {suffix}
                    </Typography.Caption>
                </Layout.Stack>
            </HintBadge>
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
