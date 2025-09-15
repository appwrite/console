<script lang="ts">
    import IconAI from './icon/ai.svelte';
    import { slide } from 'svelte/transition';
    import { InputTextarea } from '$lib/elements/forms';
    import { Card, Layout, Selector, Typography } from '@appwrite.io/pink-svelte';

    export type TableColumnSuggestions = {
        enabled: boolean;
        context?: string | null;
    }

    let {
        suggestions = $bindable()
    }: {
        suggestions: TableColumnSuggestions
    } = $props();
</script>

<Card.Base variant="secondary" radius="s" padding="xs">
    <Layout.Stack gap="m">
        <Layout.Stack direction="row" gap="s" alignItems="center">
            <IconAI />

            <Layout.Stack direction="column" gap="none">
                <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography.Text variant="m-500" color="--fgcolor-neutral-primary"
                        >Smart column suggestions</Typography.Text>

                    <Selector.Switch
                        id="suggestions"
                        label={undefined}
                        bind:checked={suggestions.enabled}
                    />
                </Layout.Stack>

                <Typography.Text color="--fgcolor-neutral-secondary">
                    Enable AI to suggest useful columns based on your table name
                </Typography.Text>
            </Layout.Stack>
        </Layout.Stack>

        {#if suggestions.enabled}
            <div transition:slide={{ duration: 200 }}>
                <InputTextarea
                    id="context"
                    rows={3}
                    maxlength={255}
                    autofocus
                    bind:value={suggestions.context}
                    placeholder="Optional: Add context to improve suggestions"
                />
            </div>
        {/if}
    </Layout.Stack>
</Card.Base>
