<script lang="ts">
    import type { Snippet } from 'svelte';
    import { Copy } from '$lib/components';
    import { writable } from 'svelte/store';
    import { Button, Form } from '$lib/elements/forms';
    import { isTabletViewport } from '$lib/stores/viewport';
    import { Badge, Divider, Layout, Sheet, Tag, Typography } from '@appwrite.io/pink-svelte';

    let {
        show = $bindable(false),
        title,
        closeOnBlur = false,
        submit,
        cancel,
        children = null,
        footer = null,
        titleBadge = null,
        topAction = null
    }: {
        show: boolean;
        title: string;
        titleBadge?: string;
        closeOnBlur?: boolean;
        topAction?:
            | {
                  text: string;
                  value: string;
                  show?: boolean;
                  mode?: 'copy-tag' | 'plaintext';
                  onClick?: () => string | Promise<string>;
              }
            | undefined;
        submit?:
            | {
                  text: string;
                  disabled?: boolean;
                  onClick?: () => boolean | void | Promise<boolean | void>;
              }
            | undefined;
        cancel?:
            | {
                  text?: string;
                  disabled?: boolean;
              }
            | undefined;
        children?: Snippet;
        footer?: Snippet | null;
    } = $props();

    let form: Form;
    let submitting = $state(writable(false));

    let copyText = $state(undefined);
</script>

<div class="sheet-container" data-side-sheet-visible={show}>
    <Sheet bind:open={show} {closeOnBlur}>
        <div slot="header" style:width="100%">
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <Layout.Stack direction="row" gap="m" alignItems="center">
                    <Typography.Text variant="m-400">{title}</Typography.Text>
                    {#if titleBadge}
                        <Badge variant="secondary" content={titleBadge} size="s" />
                    {/if}

                    {#if topAction && topAction.text && topAction.show}
                        {#if topAction.mode === 'copy-tag'}
                            <Copy value={topAction.value} {copyText}>
                                <Tag size="xs" variant="code">
                                    {topAction.text}
                                </Tag>
                            </Copy>
                        {:else}
                            <Button
                                extraCompact
                                text
                                size="xs"
                                on:click={topAction.onClick ?? undefined}>
                                {topAction.text}
                            </Button>
                        {/if}
                    {/if}
                </Layout.Stack>
            </Layout.Stack>
        </div>

        <Layout.Stack direction="column" justifyContent="space-evenly">
            <Form
                bind:this={form}
                bind:isSubmitting={submitting}
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
            </Form>

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

                                <Button
                                    size="s"
                                    secondary
                                    disabled={cancel?.disabled}
                                    on:click={() => (show = false)}
                                    >{cancel?.text ?? 'Cancel'}</Button>

                                <Button
                                    size="s"
                                    submit
                                    disabled={submit.disabled || $submitting}
                                    forceShowLoader={$submitting && $isTabletViewport}
                                    submissionLoader={$submitting && $isTabletViewport}
                                    on:click={() => form?.triggerSubmit()}>
                                    {submit.text}
                                </Button>
                            </Layout.Stack>
                        </div>
                    </Layout.Stack>
                </div>
            {/if}
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

            @media (max-width: 768px) {
                /*
                 * different mobile browsers handle bottom spaces differently,
                 * therefore, having extra bottom space doesn't hurt anyone imo!
                 */
                padding-bottom: 15rem;
            }
        }
    }

    .sheet-footer {
        left: 0;
        right: 0;
        bottom: 0;
        position: absolute;
        background: var(--bgcolor-neutral-primary);

        @media (max-width: 768px) {
            position: fixed;
        }

        & .sheet-footer-actions {
            padding-inline: var(--space-8);
            padding-block-end: var(--space-6);
        }
    }
</style>
