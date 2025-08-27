<script lang="ts">
    import type { Snippet } from 'svelte';
    import { Button, Form } from '$lib/elements/forms';
    import { Badge, Divider, Layout, Sheet, Typography } from '@appwrite.io/pink-svelte';

    let {
        show = $bindable(false),
        title,
        closeOnBlur = false,
        submit,
        children = null,
        footer = null,
        titleBadge = null
    }: {
        show: boolean;
        title: string;
        titleBadge?: string;
        closeOnBlur?: boolean;
        submit?:
            | {
                  text: string;
                  disabled?: boolean;
                  onClick?: () => boolean | void | Promise<boolean | void>;
              }
            | undefined;
        children?: Snippet;
        footer?: Snippet | null;
    } = $props();
</script>

<div class="sheet-container">
    <Sheet bind:open={show} {closeOnBlur}>
        <div slot="header" style:width="100%">
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <Layout.Stack direction="row" gap="m" alignItems="center">
                    <Typography.Text variant="m-400">{title}</Typography.Text>
                    {#if titleBadge}
                        <Badge variant="secondary" content={titleBadge} size="s" />
                    {/if}
                </Layout.Stack>
            </Layout.Stack>
        </div>

        <Layout.Stack direction="column" justifyContent="space-evenly">
            <Form
                onSubmit={async () => {
                    try {
                        const keepOpen = await submit?.onClick?.();
                        if (!keepOpen) {
                            show = false;
                        }
                    } catch (error) {
                        // error occurred, dont close the sidebar
                    }
                }}>
                <Layout.Stack gap="xl" class="sheet-content">
                    {@render children?.()}
                </Layout.Stack>

                {#if submit}
                    <div class="sheet-footer">
                        <Layout.Stack gap="l">
                            <Divider />

                            <div class="sheet-footer-actions">
                                <Layout.Stack
                                    gap="m"
                                    direction="row"
                                    justifyContent="flex-end"
                                    alignItems="center">
                                    {#if footer}
                                        {@render footer?.()}
                                    {/if}
                                    <Button size="s" secondary on:click={() => (show = false)}
                                        >Cancel</Button>
                                    <Button size="s" submit disabled={submit.disabled}>
                                        {submit.text}
                                    </Button>
                                </Layout.Stack>
                            </div>
                        </Layout.Stack>
                    </div>
                {/if}
            </Form>
        </Layout.Stack>
    </Sheet>
</div>

<style lang="scss">
    .sheet-container {
        top: 0;
        position: absolute;

        @media (max-width: 768px) {
            & :global(aside header) {
                margin-top: 6rem;
            }
        }

        & :global(.sheet-content) {
            // overflow-y: auto;
            padding-bottom: 5rem;
        }
    }

    .sheet-footer {
        left: 0;
        right: 0;
        bottom: 0;
        position: absolute;
        background: var(--bgcolor-neutral-primary);

        & .sheet-footer-actions {
            padding-inline: var(--space-8);
            padding-block-end: var(--space-6);
        }
    }
</style>
