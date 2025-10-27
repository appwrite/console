<script lang="ts">
    import { copy } from '$lib/helpers/copy';
    import { Button } from '$lib/elements/forms';
    import { ActionMenu, Alert, Icon, Layout, Popover, Typography } from '@appwrite.io/pink-svelte';
    import { IconChevronDown } from '@appwrite.io/pink-icons-svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { buildPlatformConfig, generatePromptFromConfig, type LLMPromptConfig } from './store';
    import { Click, trackEvent } from '$lib/actions/analytics';

    let {
        platform,
        configCode,
        config: customConfig
    }: {
        platform?: string;
        configCode?: string;
        config?: LLMPromptConfig;
    } = $props();

    const config = $derived.by(() => {
        if (customConfig) return customConfig;
        if (platform && configCode) return buildPlatformConfig(platform, configCode);
        throw new Error('LlmBanner: must provide either config OR (platform + configCode)');
    });

    const prompt = $derived(generatePromptFromConfig(config));

    async function copyPrompt() {
        await copy(prompt);

        trackEvent(Click.CopyPromptStarterKitClick, {
            platform: config.title
        });

        addNotification({
            type: 'success',
            message: 'Prompt copied to clipboard'
        });
    }
</script>

<Alert.Inline status="info" title="Set up your starter kit with AI">
    <Layout.Stack direction="column" gap="s">
        <Typography.Text variant="m-500">
            Copy the prompt or open it directly in your preferred tools to get step-by-step
            instructions, starter code, and SDK commands for your project.
        </Typography.Text>

        <Layout.Stack direction="row" alignItems="stretch" gap="none">
            <Button
                secondary
                size="s"
                class="btn-no-right-radius"
                on:click={copyPrompt}
                disabled={!prompt || prompt.length === 0}>Copy prompt</Button>
            <Popover let:toggle padding="none" placement="bottom-start">
                <Button
                    secondary
                    size="s"
                    class="btn-no-left-radius"
                    icon
                    on:click={toggle}
                    ariaLabel="Open action menu"
                    disabled={!prompt || prompt.length === 0}>
                    <Icon icon={IconChevronDown} />
                </Button>

                <ActionMenu.Root slot="tooltip">
                    <ActionMenu.Item.Anchor href="https://cursor.sh/" target="_blank">
                        <Layout.Stack direction="row" gap="s" alignItems="center">
                            <span class="menu-avatar"
                                ><img src="https://img.icons8.com/color/512/cursor-ai.png" /></span>
                            <Layout.Stack gap="xxs">
                                <Typography.Text variant="m-500">Open in Cursor</Typography.Text>
                                <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                    Set up starter kit in Cursor
                                </Typography.Text>
                            </Layout.Stack>
                        </Layout.Stack>
                    </ActionMenu.Item.Anchor>
                    <ActionMenu.Item.Anchor href="" target="_blank">
                        <Layout.Stack direction="row" gap="s" alignItems="center">
                            <span class="menu-avatar"
                                ><img
                                    src="https://cdn.prod.website-files.com/5e6aa3e3f001fad873b8e1f5/68cda0bd7b0c257a09a029cd_lovable-logo-icon.png"
                                    alt="" /></span>
                            <Layout.Stack gap="xxs">
                                <Typography.Text variant="m-500">Open in Lovable</Typography.Text>
                                <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                    Set up starter kit in Lovable
                                </Typography.Text>
                            </Layout.Stack>
                        </Layout.Stack>
                    </ActionMenu.Item.Anchor>
                </ActionMenu.Root>
            </Popover>
        </Layout.Stack>
    </Layout.Stack>
</Alert.Inline>

<style lang="scss">
    :global(.btn-no-right-radius),
    :global(button.btn-no-right-radius),
    :global(.button.btn-no-right-radius) {
        border-top-right-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
        border-right: none !important;
    }

    :global(.btn-no-left-radius),
    :global(button.btn-no-left-radius),
    :global(.button.btn-no-left-radius) {
        border-top-left-radius: 0 !important;
        border-bottom-left-radius: 0 !important;
    }

    /* Rounded logo chip for menu items (32px, circular with subtle border) */
    :global(.menu-avatar) {
        width: 32px;
        height: 32px;
        border-radius: 9999px;
        background: var(--bgcolor-neutral-secondary, #f4f4f7);
        border: var(--border-width-s, 1px) solid var(--border-neutral, #ededf0);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex-shrink: 0;
    }

    :global(.menu-avatar img) {
        width: 20px;
        height: 20px;
        object-fit: contain;
        display: block;
    }
</style>
