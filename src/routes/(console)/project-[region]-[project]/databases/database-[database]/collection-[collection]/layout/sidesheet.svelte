<script lang="ts">
    import type { Snippet } from 'svelte';
    import { Button, Form } from '$lib/elements/forms';
    import { Divider, Layout, Sheet, Typography } from '@appwrite.io/pink-svelte';

    let {
        show = $bindable(false),
        title,
        spaced = false,
        closeOnBlur = false,
        submit,
        children
    }: {
        show: boolean;
        title: string;
        spaced?: boolean;
        closeOnBlur?: boolean;
        submit: {
            text: string;
            disabled?: boolean;
            onClick: () => void | Promise<void>;
        };
        children: Snippet;
    } = $props();
</script>

<div class="sheet-container" class:spaced>
    <Sheet bind:open={show} {closeOnBlur}>
        <div slot="header" style:width="100%">
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <Layout.Stack direction="row" gap="m" alignItems="center">
                    <Typography.Text variant="m-400">{title}</Typography.Text>
                </Layout.Stack>
            </Layout.Stack>
        </div>

        <Layout.Stack direction="column" justifyContent="space-evenly">
            <Form
                onSubmit={async () => {
                    await submit.onClick();
                    show = false;
                }}>
                <Layout.Stack gap="xl">
                    {@render children()}
                </Layout.Stack>

                <div class="sheet-footer">
                    <Layout.Stack gap="l">
                        <Divider />

                        <div class="sheet-footer-actions">
                            <Layout.Stack gap="m" direction="row" justifyContent="flex-end">
                                <Button size="s" secondary on:click={() => (show = false)}
                                    >Cancel</Button>

                                <Button size="s" submit disabled={submit.disabled}>
                                    {submit.text}
                                </Button>
                            </Layout.Stack>
                        </div>
                    </Layout.Stack>
                </div>
            </Form>
        </Layout.Stack>
    </Sheet>
</div>

<style lang="scss">
    .sheet-container {
        top: 0;
        position: absolute;

        @media (max-width: 768px) {
            &.spaced :global(aside header) {
                margin-top: 6rem;
            }
        }
    }

    .sheet-footer {
        left: 0;
        right: 0;
        bottom: 0;
        position: absolute;

        & .sheet-footer-actions {
            padding-inline: var(--space-8);
            padding-block-end: var(--space-6);
        }
    }
</style>
