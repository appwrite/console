<script lang="ts">
    import IconAI from './icon/ai.svelte';
    import { slide } from 'svelte/transition';
    import { tableColumnSuggestions } from './store';
    import { Button, InputTextarea } from '$lib/elements/forms';
    import { Card, Icon, Layout, Selector, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { isCloud } from '$lib/system';
    import { IconExternalLink } from '@appwrite.io/pink-icons-svelte';

    onMount(() => {
        if (featureActive) {
            $tableColumnSuggestions.enabled = true;
        }
    });

    const featureActive = $derived(isCloud);

    const subtitle = $derived.by(() => {
        return featureActive
            ? 'Enable AI to suggest useful columns based on your table name'
            : 'AI suggestions are available on all Appwrite Cloud projects';
    });
</script>

<Card.Base variant="secondary" radius="s" padding="xs">
    <Layout.Stack gap="m">
        <Layout.Stack
            gap="s"
            direction="row"
            alignItems={$isSmallViewport ? 'flex-start' : 'center'}>
            <IconAI />

            <Layout.Stack direction="column" gap="none">
                <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography.Text variant="m-500" color="--fgcolor-neutral-primary"
                        >Smart column suggestions</Typography.Text>

                    <div class="suggestions-switch">
                        <Selector.Switch
                            id="suggestions"
                            label={undefined}
                            disabled={!featureActive}
                            bind:checked={$tableColumnSuggestions.enabled} />
                    </div>
                </Layout.Stack>

                <Typography.Text color="--fgcolor-neutral-secondary">
                    {subtitle}
                </Typography.Text>
            </Layout.Stack>
        </Layout.Stack>

        {#if !featureActive}
            <Layout.Stack inline alignItems="flex-end">
                <Button
                    external
                    secondary
                    fullWidthMobile
                    href="https://cloud.appwrite.io/register">
                    Sign up

                    <Icon icon={IconExternalLink} size="s" />
                </Button>
            </Layout.Stack>
        {/if}

        <!-- just being safe with extra guard! -->
        {#if $tableColumnSuggestions.enabled && featureActive}
            <div transition:slide={{ duration: 200 }}>
                <InputTextarea
                    id="context"
                    rows={3}
                    maxlength={255}
                    bind:value={$tableColumnSuggestions.context}
                    placeholder="Optional: Add context to improve suggestions" />
            </div>
        {/if}
    </Layout.Stack>
</Card.Base>

<style lang="scss">
    .suggestions-switch :global(button):not(:disabled) {
        cursor: pointer;
    }
</style>
