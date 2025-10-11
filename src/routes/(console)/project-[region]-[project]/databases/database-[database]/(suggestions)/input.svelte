<script lang="ts">
    import { onMount } from 'svelte';
    import { isCloud } from '$lib/system';
    import IconAI from './icon/ai.svelte';
    import { slide } from 'svelte/transition';
    import { tableColumnSuggestions } from './store';
    import { getTerminologies } from '$database/(entity)';
    import { Button, InputTextarea } from '$lib/elements/forms';
    import { Card, Layout, Selector, Typography } from '@appwrite.io/pink-svelte';

    onMount(() => {
        if (featureActive) {
            $tableColumnSuggestions.enabled = true;
        }
    });

    const featureActive = $derived(isCloud);
    const { terminology } = getTerminologies();
    const field = terminology.field.lower;
    const entity = terminology.entity.lower.singular;

    const title = $derived.by(() => {
        return featureActive
            ? `Smart ${field.singular} suggestions`
            : `Smart ${field.singular} suggestions available on Cloud`;
    });

    const subtitle = $derived.by(() => {
        return featureActive
            ? `Enable AI to suggest useful ${field.plural} based on your ${entity} name`
            : `Sign up for Cloud to generate ${field.plural} based on your ${entity} name`;
    });
</script>

<Card.Base variant="secondary" radius="s" padding="xs">
    <Layout.Stack gap={featureActive ? 'm' : 'l'}>
        <Layout.Stack gap="s" direction="row" alignItems="flex-start">
            <IconAI />

            <Layout.Stack direction="column" gap="none">
                <Typography.Text variant="m-500" color="--fgcolor-neutral-primary"
                    >{title}</Typography.Text>

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
