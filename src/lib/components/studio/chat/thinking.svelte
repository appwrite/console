<script lang="ts">
    import { Typography, ShimmerText } from '@appwrite.io/pink-svelte';
    import { IconChevronDown, IconChevronUp } from '@appwrite.io/pink-icons-svelte';
    import { Icon } from '@appwrite.io/pink-svelte';
    import type { ImagineUIDataParts } from '$shared-types';

    let {
        data,
        didReceiveFirstAsisstantTextChunk
    }: { data: ImagineUIDataParts['thinking']; didReceiveFirstAsisstantTextChunk: boolean } =
        $props();

    let expanded = $state(true);

    $effect(() => {
        if (data.state === 'done' && didReceiveFirstAsisstantTextChunk) {
            setTimeout(() => {
                expanded = false;
            }, 3000);
        }
    });

    function toggle() {
        expanded = !expanded;
    }
</script>

<button class="thinking-container" onclick={toggle} type="button">
    {#if data.state === 'streaming'}
        <Typography.Code size="s">
            <ShimmerText>Thinking...</ShimmerText>
            {#if expanded && data.text}
                <div class="thoughts">
                    {data.text}
                </div>
            {/if}
        </Typography.Code>
    {:else if data.state === 'done'}
        <Typography.Code size="s">
            <span class="summary">
                Thought for {Math.floor(data.durationMs / 1000)} seconds
                <Icon icon={expanded ? IconChevronUp : IconChevronDown} size="s" />
            </span>
            {#if expanded && data.text}
                <div class="thoughts">
                    {data.text}
                </div>
            {/if}
        </Typography.Code>
    {/if}
</button>

<style>
    .thinking-container {
        background: none;
        border: none;
        padding: 0;
        text-align: left;
        cursor: pointer;
        width: 100%;
    }

    .thinking-container:hover {
        opacity: 0.8;
    }

    .summary {
        display: inline-flex;
        gap: 4px;
        align-items: center;
        justify-content: space-between;
    }

    .toggle-hint {
        font-size: 0.8em;
        opacity: 0.6;
        margin-left: 0.5rem;
    }

    .thoughts {
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        white-space: pre-wrap;
        font-family: inherit;
    }
</style>
