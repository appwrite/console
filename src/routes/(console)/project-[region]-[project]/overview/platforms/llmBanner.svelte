<script lang="ts">
    import { copy } from '$lib/helpers/copy';
    import { Button } from '$lib/elements/forms';
    import { Alert, Typography } from '@appwrite.io/pink-svelte';
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

<Alert.Inline status="info" title={config.title}>
    <Typography.Text variant="m-500">
        Paste it into your LLM to generate a working setup.
    </Typography.Text>

    <Button compact size="s" on:click={copyPrompt} disabled={!prompt || prompt.length === 0}
        >Copy prompt</Button>
</Alert.Inline>
