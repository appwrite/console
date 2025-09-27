<script lang="ts">
    import IconAI from './icon/ai.svelte';
    import { slide } from 'svelte/transition';
    import { tableColumnSuggestions } from './store';
    import { InputTextarea } from '$lib/elements/forms';
    import { Card, Layout, Selector, Typography } from '@appwrite.io/pink-svelte';
    import { onMount } from 'svelte';
    import { isSmallViewport } from '$lib/stores/viewport';

    onMount(() => {
        // enable by default!
        $tableColumnSuggestions.enabled = true;
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
                            bind:checked={$tableColumnSuggestions.enabled} />
                    </div>
                </Layout.Stack>

                <Typography.Text color="--fgcolor-neutral-secondary">
                    Enable AI to suggest useful columns based on your table name
                </Typography.Text>
            </Layout.Stack>
        </Layout.Stack>

        {#if $tableColumnSuggestions.enabled}
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
    .suggestions-switch :global(button) {
        cursor: pointer;
    }
</style>
