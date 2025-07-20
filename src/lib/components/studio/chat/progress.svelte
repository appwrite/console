<script lang="ts">
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconCheckCircle } from '@appwrite.io/pink-icons-svelte';
    import { Spinner } from '@appwrite.io/pink-svelte';
    import { slide } from 'svelte/transition';
    import type { ImagineUIToolParts } from '$shared-types';

    let {
        version,
        isLatestVersion,
        toolCallParts,
    }: {
        version: number | null;
        isLatestVersion: boolean;
        toolCallParts: ImagineUIToolParts[];
    } = $props();

    const EXPANDED_SHOW_ITEMS = 3;
    let isExpanded = $state(false);

    // Filter and process parts
    let filteredParts = $derived(() => {
        let parts = toolCallParts.filter(
            (part) =>
                part.type.startsWith('tool-readFile') || part.type.startsWith('tool-writeFile') || part.type.startsWith('tool-listFilesInDirectory') || part.type.startsWith('tool-deleteFile')
        );

        const showMoreButton = parts.length > EXPANDED_SHOW_ITEMS;

        // If showMoreButton is true and not expanded, only show last N items
        if (showMoreButton && !isExpanded) {
            parts = parts.slice(-EXPANDED_SHOW_ITEMS);
        }

        return { parts, showMoreButton };
    });

    // duplicate the amount of tools to test stuff

    function toggleExpanded() {
        isExpanded = !isExpanded;
    }
</script>

{#if filteredParts().parts.length > 0}
    <div class="tool-calls-container">
        <div class="header version-header">
            <div class="version-text">
                {#if version}
                    Version {version}
                {:else}
                    Making changes...
                {/if}
            </div>
            {#if isLatestVersion}
                <div class="is-latest">Latest</div>
            {/if}
        </div>

        <div class="content" class:has-more={filteredParts.length > EXPANDED_SHOW_ITEMS}>
            {#each filteredParts().parts as toolCall, i (i)}
                {@const isLoading = toolCall.state === 'input-available'}

                <div
                    class="tool-item"
                    style:opacity={isExpanded || i < EXPANDED_SHOW_ITEMS ? 1 : 0}
                    transition:slide={{ duration: 300 }}>
                    <div class={`icon-container ${isLoading ? 'icon-xs' : ''}`}>
                        {#if isLoading}
                            <Icon icon={Spinner} size="s" />
                        {:else}
                            <Icon icon={IconCheckCircle} size="s" />
                        {/if}
                    </div>

                    <div class="tool-text">
                        {#if toolCall.type === 'tool-writeFile'}
                            {isLoading
                                ? `Writing file ${toolCall.input.path}...`
                                : `Wrote file ${toolCall.input.path}`}
                        {:else if toolCall.type === 'tool-readFile'}
                            {isLoading
                                ? `Reading file ${toolCall.input.path}...`
                                : `Read file ${toolCall.input.path}`}
                        {:else if toolCall.type === 'tool-listFilesInDirectory'}
                            {isLoading
                                ? `Listing files in ${toolCall.input.path}...`
                                : `Listed files in ${toolCall.input.path}`}
                        {:else if toolCall.type === 'tool-deleteFile'}
                            {isLoading
                                ? `Deleting file ${toolCall.input.path}...`
                                : `Deleted file ${toolCall.input.path}`}
                        {:else if toolCall.type === 'tool-moveFile'}
                            {isLoading
                                ? `Moving file ${toolCall.input.path}...`
                                : `Moved file ${toolCall.input.path}`}
                        {/if}
                    </div>

                    <div class="connector-line"></div>
                </div>
            {/each}
        </div>

        {#if filteredParts().showMoreButton}
            <button class="show-more-btn" onclick={toggleExpanded}>
                {isExpanded ? 'Show less' : 'Show more'}
            </button>
        {/if}
    </div>
{/if}

<style>
    .tool-calls-container {
        position: relative;
        margin-top: 0.4rem;
        margin-bottom: 0.4rem;
        font-size: 0.75rem;
        background: var(--bgcolor-neutral-primary);
        border: 1px solid var(--border-neutral);
        border-top: 0;
        border-radius: 8px;
        transition: all 0.3s ease;
        box-shadow: 0 1px 3px var(--overlay-neutral-hover);
    }

    .header {
        background: var(--bgcolor-neutral-secondary);
        border: 1px solid var(--border-neutral);
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        border-left: 0;
        border-right: 0;
        color: var(--fgcolor-neutral-secondary);
        height: 2rem;
        display: flex;
        align-items: center;
        padding: 0.5rem 0.75rem;
    }

    .version-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .is-latest {
        font-size: 0.75rem;
        font-weight: 500;
        color: var(--fgcolor-neutral-secondary);
    }

    .version-text {
        font-size: 0.75rem;
        font-weight: 500;
    }

    .content {
        padding: 0.5rem;
        overflow: hidden;
    }

    .content.has-more {
        margin: 0.5rem 0;
    }

    .tool-item {
        font-size: 0.725rem;
        color: var(--fgcolor-neutral-tertiary);
        height: 1.375rem;
        font-family: monospace;
        gap: 0.5rem;
        display: flex;
        align-items: center;
        position: relative;
    }

    .icon-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 0.875rem;
        background: var(--bgcolor-neutral-primary);
        z-index: 10;
        color: var(--fgcolor-neutral-weak);
    }

    .icon {
        width: 0.75rem;
        height: 0.75rem;
    }

    .tool-text {
        flex: 1;
        display: flex;
        align-items: center;
    }

    .connector-line {
        position: absolute;
        background: var(--border-neutral);
        height: 0.625rem;
        top: -0.3125rem;
        width: 1px;
        left: 0.4375rem;
    }

    .icon-xs {
        transform: scale(0.8);
    }

    :global(.show-more-btn) {
        font-size: 0.625rem !important;
        background: var(--bgcolor-neutral-secondary) !important;
        border-radius: 9999px !important;
        border: 1px solid var(--border-neutral) !important;
        color: var(--fgcolor-neutral-primary) !important;
        height: 1.25rem !important;
        padding: 0 0.5rem !important;
        position: absolute !important;
        z-index: 20 !important;
        left: 50% !important;
        transform: translateX(-50%) translateY(50%) !important;
        bottom: 0 !important;
        line-height: 1.2 !important;
    }

    @keyframes spin {
        from {
            transform: rotate(0deg);
        }
        to {
            transform: rotate(360deg);
        }
    }

    .animate-spin {
        animation: spin 1s linear infinite;
    }
</style>
