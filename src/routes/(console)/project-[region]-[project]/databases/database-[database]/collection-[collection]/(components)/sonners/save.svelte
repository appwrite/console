<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import CheckCircleDuotone from './icons/CheckCircleDuotone.svelte';
    import {
        Badge,
        FloatingActionBar,
        Layout,
        Spinner,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { sleep } from '$lib/helpers/promises';
    import { isSmallViewport } from '$lib/stores/viewport';

    let {
        state = null
    }: {
        state: 'saving' | 'saved' | null;
    } = $props();

    let previousState = state;

    $effect(() => {
        if (state === 'saved' && previousState !== 'saved') {
            sleep(3000).then(() => {
                previousState = state;
                state = null;
            });
        }
    });
</script>

{#if state}
    <div data-state={state} class="floating-action-bar">
        <FloatingActionBar>
            <svelte:fragment slot="start">
                <Layout.Stack
                    inline
                    gap="s"
                    direction="row"
                    alignItems="center"
                    style="width: max-content;">
                    {#if state === 'saving'}
                        <Spinner size="m" />

                        <Typography.Caption variant="500">Saving changes...</Typography.Caption>
                    {:else}
                        <CheckCircleDuotone />

                        <Typography.Caption variant="500">Changes saved</Typography.Caption>
                    {/if}
                </Layout.Stack>
            </svelte:fragment>

            <svelte:fragment slot="end">
                {#if state === 'saved' && !$isSmallViewport}
                    <Button secondary size="xs" on:click={async () => {}}>
                        <Typography.Caption variant="500">Undo</Typography.Caption>

                        <Badge content="⌘Z" variant="secondary" size="xs" />
                    </Button>
                {/if}
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
            position: fixed;
            max-width: 100%;
        }

        & :global(div:first-of-type) {
            max-width: 280px;
            transition: width 250ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        &[data-state='saved'] :global(div:first-of-type) {
            height: 44px;

            @media (max-width: 768px) {
                width: fit-content;
            }
        }

        &[data-state='saving'] :global(div:first-of-type) {
            width: fit-content;
        }
    }
</style>
