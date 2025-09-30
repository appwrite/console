<script lang="ts">
    import { onMount } from 'svelte';
    import { isCloud } from '$lib/system';
    import IconAI from './icon/ai.svelte';
    import { slide } from 'svelte/transition';
    import { tableColumnSuggestions } from './store';
    import { Button, InputTextarea } from '$lib/elements/forms';
    import { Card, Layout, Selector, Typography } from '@appwrite.io/pink-svelte';

    onMount(() => {
        if (featureActive) {
            $tableColumnSuggestions.enabled = true;
        }
    });

    const featureActive = $derived(isCloud);

    const title = $derived.by(() => {
        return featureActive
            ? 'Smart column suggestions'
            : 'Smart column suggestions available on Cloud';
    });

    const subtitle = $derived.by(() => {
        return featureActive
            ? 'Enable AI to suggest useful columns based on your table name'
            : 'Sign up for Cloud to generate columns based on your table name';
    });
</script>

<Card.Base variant="secondary" radius="s" padding="xs">
    <Layout.Stack gap={featureActive ? 'm' : 'l'}>
        <Layout.Stack gap="s" direction="row" alignItems="flex-start">
            <IconAI />

            <Layout.Stack direction="column" gap="none">
                <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography.Text variant="m-500" color="--fgcolor-neutral-primary"
                        >{title}</Typography.Text>
                </Layout.Stack>

                <Typography.Text color="--fgcolor-neutral-secondary">
                    {subtitle}
                </Typography.Text>
            </Layout.Stack>

            {#if featureActive}
                <div class="suggestions-switch">
                    <Selector.Switch
                        id="suggestions"
                        label={undefined}
                        bind:checked={$tableColumnSuggestions.enabled} />
                </div>
            {/if}
        </Layout.Stack>

        {#if !featureActive}
            <Layout.Stack>
                <Button external secondary href="https://cloud.appwrite.io/register">
                    Sign up
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
