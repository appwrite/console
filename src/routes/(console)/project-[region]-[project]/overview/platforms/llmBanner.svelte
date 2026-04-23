<script lang="ts">
    import { copy } from '$lib/helpers/copy';
    import { Button } from '$lib/elements/forms';
    import {
        ActionMenu,
        Alert,
        Icon,
        Layout,
        Popover,
        Typography,
        Button as PinkButton
    } from '@appwrite.io/pink-svelte';
    import { IconChevronDown, IconChevronUp, IconLovable } from '@appwrite.io/pink-icons-svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { buildPlatformConfig, generatePromptFromConfig, type LLMPromptConfig } from './store';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import IconAINotification from '../../databases/database-[database]/(suggestions)/icon/aiNotification.svelte';
    import Avatar from '$lib/components/avatar.svelte';
    import CursorIcon from '$routes/(console)/project-[region]-[project]/overview/components/CursorIconLarge.svelte';
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
    <Alert.Inline
        status="info"
        title="Set up your starter kit with AI"
        dismissible
        --bgcolor-neutral-default="var(--bgcolor-neutral-primary)"
        --fgcolor-info="var(--fgcolor-neutral-primary)"
        on:dismiss={() => (showAlert = false)}>
        <svelte:fragment slot="icon">
            <IconAINotification />
        </svelte:fragment>
        <Layout.Stack direction="column" class="alert-content" gap="l">
            <Layout.Stack direction="column" alignItems="center" gap="s">
                <Typography.Text>
                    Copy the prompt or open it directly in an AI tool like Cursor or Lovable to get
                    step-by-step instructions, starter code, and SDK commands for your project.
                </Typography.Text>
            </Layout.Stack>

            <Popover let:toggle let:showing padding="none" placement="bottom-start">
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
                                    <Layout.Stack direction="row" gap="s" alignItems="center">
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
                                                variant="m-500">{o.label}</Typography.Text>
                                            <Typography.Text color="--fgcolor-neutral-tertiary">
                                                {o.description}
                                            </Typography.Text>
                                        </Layout.Stack>
                                    </Layout.Stack>
                                </ActionMenu.Item.Button>
                            {/if}
                        {/each}
                    </ActionMenu.Root>
                </svelte:fragment>
                <PinkButton.Split>
                    <Button
                        secondary
                        size="s"
                        class={validOpeners.length ? 'btn-no-right-radius' : ''}
                        on:click={copyPrompt}
                        disabled={!prompt || prompt.length === 0}>Copy setup prompt</Button>
                    {#if validOpeners.length}
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
                    {/if}
                </PinkButton.Split>
            </Popover>
        </Layout.Stack>
    </Alert.Inline>
{/if}
