<script lang="ts">
    import { Badge, FloatingActionBar, Layout } from '@appwrite.io/pink-svelte';

    let {
        show = true
    }: {
        show?: boolean;
    } = $props();
</script>

{#if show}
    <div class="floating-action-bar">
        <FloatingActionBar>
            <svelte:fragment slot="start">
                <Layout.Stack
                    inline
                    gap="xs"
                    direction="row"
                    alignItems="center"
                    style="width: max-content;">
                    Press

                    <Layout.Stack direction="row" inline gap="xxxs" style="height: fit-content">
                        <Badge content="⌘" variant="secondary" size="xs" />

                        <Badge content="K" variant="secondary" size="xs" />
                    </Layout.Stack>

                    for suggestions
                </Layout.Stack>
            </svelte:fragment>
        </FloatingActionBar>
    </div>
{/if}

<style lang="scss">
    .floating-action-bar {
        max-width: 205px;
        transform: translateX(60%);

        @media (max-width: 768px) {
            left: 50%;
            bottom: 5%;
            position: absolute;
        }

        & :global(div:first-of-type) {
            height: 44px;
            width: fit-content;
            align-content: center;
        }
    }
</style>
