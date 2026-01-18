<script lang="ts">
    import { FloatingActionBar, Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconExclamationCircle } from '@appwrite.io/pink-icons-svelte';

    let {
        error
    }: {
        error: string;
    } = $props();
</script>

{#if error}
    <div class="floating-action-bar">
        <FloatingActionBar>
            <svelte:fragment slot="start">
                <Layout.Stack
                    inline
                    gap="s"
                    direction="row"
                    alignItems="center"
                    style="width: max-content;">
                    <Icon icon={IconExclamationCircle} color="--fgcolor-error" />

                    <div class="error-message">
                        {error}
                    </div>
                </Layout.Stack>
            </svelte:fragment>
        </FloatingActionBar>
    </div>
{/if}

<style lang="scss">
    .floating-action-bar {
        max-width: 325px;
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

    .error-message {
        flex: 1;
        font-size: 13px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-family: var(--font-family-code);
    }
</style>
