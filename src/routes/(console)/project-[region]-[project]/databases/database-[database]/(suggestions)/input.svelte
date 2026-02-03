<script lang="ts">
    import { onMount } from 'svelte';
    import { isCloud } from '$lib/system';
    import IconAI from './icon/ai.svelte';
    import { slide } from 'svelte/transition';
    import { entityColumnSuggestions } from './store';
    import { getTerminologies } from '$database/(entity)';
    import { randomDataModalState } from '$database/store';
    import { Button, InputTextarea, Seekbar } from '$lib/elements/forms';
    import { Card, Layout, Selector, Typography } from '@appwrite.io/pink-svelte';

    const {
        isModal = false,
        required = false,
        context = 'suggestions',
        showSampleCountPicker = false
    }: {
        isModal?: boolean;
        required?: boolean;
        context?: 'suggestions' | 'data';
        showSampleCountPicker?: boolean;
    } = $props();

    onMount(() => {
        if (featureActive) {
            $entityColumnSuggestions.enabled = true;
        }
    });

    const featureActive = $derived(isCloud);
    const { terminology } = getTerminologies();

    const type = terminology.type;
    const field = terminology.field.lower;
    const record = terminology.record.lower;
    const entity = terminology.entity.lower.singular;

    const title = $derived.by(() => {
        switch (type) {
            default:
            case 'legacy':
            case 'tablesdb':
                return featureActive
                    ? `Smart ${field.singular} suggestions`
                    : `Smart ${field.singular} suggestions available on Cloud`;

            case 'documentsdb':
                return featureActive ? `Sample Data` : `Sample Data available on Cloud`;
        }
    });

    const subtitle = $derived.by(() => {
        const isDocs = type === 'documentsdb';

        if (featureActive) {
            return isDocs
                ? `Generate sample ${record.plural} based on your ${entity} name`
                : `Enable AI to suggest useful ${field.plural} based on your ${entity} name`;
        }

        return isDocs
            ? `Sign up for Cloud to generate sample documents based on your ${entity} name`
            : `Sign up for Cloud to generate ${field.plural} based on your ${entity} name`;
    });
</script>

{#if !required}
    <Card.Base variant="secondary" radius="s" padding="xs">
        {@render contextAndSeekbar(false)}
    </Card.Base>
{:else}
    {@render contextAndSeekbar(true, 'Context', context)}
{/if}

{#snippet contextAndSeekbar(
    required = false,
    contextLabel = undefined,
    contextType = 'suggestions'
)}
    <Layout.Stack gap={featureActive ? 'm' : 'l'} style="padding-block-end: var(--gap-m);">
        {#if !required}
            <Layout.Stack gap="s" direction="row" alignItems="flex-start">
                <IconAI />

                <Layout.Stack direction="column" gap="none">
                    <Typography.Text variant="m-500" color="--fgcolor-neutral-primary"
                        >{title}</Typography.Text>

                    <Typography.Text color="--fgcolor-neutral-secondary">
                        {subtitle}
                    </Typography.Text>
                </Layout.Stack>

                {#if featureActive && !isModal}
                    <div class="suggestions-switch">
                        <Selector.Switch
                            id="suggestions"
                            label={undefined}
                            bind:checked={$entityColumnSuggestions.enabled} />
                    </div>
                {/if}
            </Layout.Stack>
        {/if}

        {#if !featureActive}
            <Layout.Stack>
                <Button external secondary href="https://cloud.appwrite.io/register">
                    Sign up
                </Button>
            </Layout.Stack>
        {/if}

        <!-- just being safe with extra guard! -->
        {#if $entityColumnSuggestions.enabled && featureActive}
            <div class="context-input" class:required transition:slide={{ duration: 200 }}>
                <Layout.Stack gap="l">
                    <InputTextarea
                        id="context"
                        rows={3}
                        maxlength={255}
                        label={contextLabel}
                        bind:value={$entityColumnSuggestions.context}
                        placeholder="Optional: Add context to improve {contextType}" />

                    {#if showSampleCountPicker}
                        <Layout.Stack gap="xl" style="padding-inline: var(--space-4, 8px);">
                            <Typography.Text>
                                Select how many random documents to generate for testing.
                            </Typography.Text>

                            <Seekbar
                                max={100}
                                extraBlockStart
                                breakpointCount={5}
                                bind:value={$randomDataModalState.value} />
                        </Layout.Stack>
                    {/if}
                </Layout.Stack>
            </div>
        {/if}
    </Layout.Stack>
{/snippet}

<style lang="scss">
    .suggestions-switch :global(button):not(:disabled) {
        cursor: pointer;
    }

    .context-input :global(.input) {
        background: var(--bgcolor-neutral-primary);
    }

    .context-input.required :global(.input) {
        background: var(--bgcolor-neutral-default);
    }
</style>
