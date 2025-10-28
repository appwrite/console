<script lang="ts">
    import { copy } from '$lib/helpers/copy';
    import { Button } from '$lib/elements/forms';
    import { ActionMenu, Alert, Icon, Layout, Popover, Typography } from '@appwrite.io/pink-svelte';
    import { IconChevronDown, IconChevronUp, IconLovable } from '@appwrite.io/pink-icons-svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { buildPlatformConfig, generatePromptFromConfig, type LLMPromptConfig } from './store';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import IconAINotification from '../../databases/database-[database]/(suggestions)/icon/aiNotification.svelte';
    import Avatar from '$lib/components/avatar.svelte';
    import CursorIcon from '../components/CursorIconLarge.svelte';
    import type { ComponentType } from 'svelte';

    let {
        platform,
        configCode,
        alreadyExistsInstructions,
        config: customConfig,
        openers = [] as Array<SupportedAgents>
    }: {
        platform?: string;
        configCode?: string;
        alreadyExistsInstructions?: string;
        config?: LLMPromptConfig;
        openers?: Array<SupportedAgents>;
    } = $props();

    const config = $derived.by(() => {
        if (customConfig) return customConfig;
        if (platform && configCode)
            return buildPlatformConfig(platform, configCode, alreadyExistsInstructions);
        throw new Error('LlmBanner: must provide either config OR (platform + configCode)');
    });

    const prompt = $derived(generatePromptFromConfig(config));

    let showAlert = $state(true);

    type OpenerConfig = {
        id: SupportedAgents;
        label: string;
        description: string;
        href: (prompt: string) => string;
        icon?: ComponentType;
        imgSrc?: string;
        alt: string;
    };

    type SupportedAgents = 'cursor' | 'lovable';

    const openersConfig: Record<SupportedAgents, OpenerConfig> = {
        cursor: {
            id: 'cursor',
            label: 'Open in Cursor',
            description: 'Set up starter kit in Cursor',
            href: (p: string) => {
                trackEvent(Click.OpenInCursorClick, {
                    platform: config.title
                });
                const u = new URL('https://cursor.com/link/prompt');
                u.searchParams.set('text', p);
                return u.toString();
            },
            icon: CursorIcon,
            alt: 'Cursor'
        },
        lovable: {
            id: 'lovable',
            label: 'Open in Lovable',
            description: 'Set up starter kit in Lovable',
            href: (p: string) => {
                trackEvent(Click.OpenInLovableClick, {
                    platform: config.title
                });
                const u = new URL('https://lovable.dev/');
                u.searchParams.set('autosubmit', 'true');
                u.searchParams.set('prompt', p);
                return u.toString();
            },
            icon: IconLovable,
            alt: 'Lovable'
        }
    };

    const validOpeners = $derived(openers.filter((id) => openersConfig[id]));

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

{#if showAlert}
    <div class="custom-inline-alert">
        <Alert.Inline
            status="info"
            title="Set up your starter kit with AI"
            dismissible
            on:dismiss={() => (showAlert = false)}>
            <svelte:fragment slot="icon">
                <IconAINotification />
            </svelte:fragment>
            <Layout.Stack direction="column" class="alert-content" gap="l">
                <Layout.Stack direction="column" alignItems="center" gap="s">
                    <Typography.Text variant="m-400">
                        Copy the prompt or open it directly in an AI tool like Cursor or Lovable to
                        get step-by-step instructions, starter code, and SDK commands for your
                        project.
                    </Typography.Text>
                </Layout.Stack>

                <Layout.Stack direction="row" alignItems="stretch" gap="none">
                    <Button
                        secondary
                        size="s"
                        class={validOpeners.length ? 'btn-no-right-radius' : ''}
                        on:click={copyPrompt}
                        disabled={!prompt || prompt.length === 0}>Copy setup prompt</Button>
                    {#if validOpeners.length}
                        <Popover let:toggle let:showing padding="none" placement="bottom-start">
                            <Button
                                secondary
                                size="s"
                                class="btn-no-left-radius"
                                icon
                                on:click={toggle}
                                ariaLabel="Open action menu"
                                disabled={!prompt || prompt.length === 0}>
                                <Icon icon={showing ? IconChevronUp : IconChevronDown} />
                            </Button>

                            <svelte:fragment slot="tooltip" let:toggle>
                                <ActionMenu.Root>
                                    {#each validOpeners as openerId}
                                        {@const o = openersConfig[openerId]}
                                        {#if o}
                                            <ActionMenu.Item.Button
                                                on:click={(e) => {
                                                    window.open(
                                                        o.href(prompt),
                                                        '_blank',
                                                        'noopener,noreferrer'
                                                    );
                                                    toggle(e);
                                                }}>
                                                <Layout.Stack
                                                    direction="row"
                                                    gap="s"
                                                    alignItems="center">
                                                    <Avatar size="s" alt={o.alt}>
                                                        {#if o.icon}
                                                            <Icon icon={o.icon} size="l" />
                                                        {:else if o.imgSrc}
                                                            <img src={o.imgSrc} alt={o.alt} />
                                                        {/if}
                                                    </Avatar>
                                                    <Layout.Stack gap="none">
                                                        <Typography.Text
                                                            color="--fgcolor-neutral-secondary"
                                                            variant="m-500"
                                                            >{o.label}</Typography.Text>
                                                        <Typography.Text
                                                            variant="m-400"
                                                            color="--fgcolor-neutral-tertiary">
                                                            {o.description}
                                                        </Typography.Text>
                                                    </Layout.Stack>
                                                </Layout.Stack>
                                            </ActionMenu.Item.Button>
                                        {/if}
                                    {/each}
                                </ActionMenu.Root>
                            </svelte:fragment>
                        </Popover>
                    {/if}
                </Layout.Stack>
            </Layout.Stack>
        </Alert.Inline>
    </div>
{/if}

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

    :global(.menu-avatar img) {
        width: 20px;
        height: 20px;
        object-fit: contain;
        display: block;
    }

    .custom-inline-alert {
        & :global(article) {
            border-radius: var(--border-radius-medium);
            padding: var(--space-6, 12px);
            padding-right: var(--space-4, 12px);
            background: var(--bgcolor-neutral-primary);
            border: var(--border-width-s) solid var(--border-neutral);
        }
        & :global(article > div) {
            gap: var(--space-6);
        }
        & :global(.ai-icon-holder.notification) {
            height: 36px !important;
        }

        & :global(h5) {
            font-weight: 500 !important;
            color: var(--fgcolor-neutral-primary) !important;
        }

        & :global(p) {
            color: var(--fgcolor-neutral-secondary) !important;
        }

        & :global(.alert-content) {
            margin-top: 2px !important;
        }

        & :global([role='tooltip'] > div) {
            gap: var(--space-2, 4px) !important;
        }
    }
</style>
