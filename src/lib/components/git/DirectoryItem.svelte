<script lang="ts">
    import { getContext } from 'svelte';
    import type { createTreeView } from '@melt-ui/svelte';
    import { IconChevronRight } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Selector, Spinner, Typography } from '@appwrite.io/pink-svelte';

    export let directories: Array<{
        title: string;
        fileCount?: number;
        fullPath: string;
        thumbnailUrl?: string;
        thumbnailIcon?: typeof Icon;
        thumbnailHtml?: string;
        children?: typeof directories;
        hasChildren?: boolean;
        showThumbnail?: boolean;
        loading?: boolean;
    }>;
    export let level = 0;
    export let containerWidth: number | undefined;
    export let selectedPath: string | undefined;
    export let onSelect:
        | ((detail: { title: string; fullPath: string; hasChildren: boolean }) => void)
        | undefined;

    const Radio = Selector.Radio;

    let radioInputs: Array<HTMLInputElement | undefined> = [];
    let value: string | undefined;
    let thumbnailStates: Array<{ loading: boolean; error: boolean }> = [];

    $: if (directories) {
        if (thumbnailStates.length < directories.length) {
            thumbnailStates = [
                ...thumbnailStates,
                ...Array.from({ length: directories.length - thumbnailStates.length }, () => ({
                    loading: true,
                    error: false
                }))
            ];
        } else if (thumbnailStates.length > directories.length) {
            thumbnailStates = thumbnailStates.slice(0, directories.length);
        }
    }

    function handleThumbnailLoad(index: number) {
        if (!thumbnailStates[index]) return;
        thumbnailStates[index].loading = false;
        thumbnailStates[index].error = false;
    }

    function handleThumbnailError(index: number) {
        if (!thumbnailStates[index]) return;
        thumbnailStates[index].loading = false;
        thumbnailStates[index].error = true;
    }

    const {
        elements: { item, group },
        helpers: { isExpanded }
    } = getContext<ReturnType<typeof createTreeView>>('tree');

    const paddingLeftStyle = `padding-left: ${32 * level + 8}px`;

    $: if (selectedPath && directories?.length) {
        const idx = directories.findIndex((d) => d.fullPath === selectedPath);
        if (idx !== -1 && radioInputs[idx]) {
            radioInputs[idx].checked = true;
        }
    }
</script>

{#each directories as { title, fileCount, fullPath, thumbnailUrl, thumbnailIcon, thumbnailHtml, children, hasChildren: explicitHasChildren, showThumbnail = true, loading = false }, i}
    {@const hasChildren = explicitHasChildren ?? !!children?.length}
    {@const __MELTUI_BUILDER_1__ = $group({ id: fullPath })}
    {@const __MELTUI_BUILDER_0__ = $item({
                id: fullPath,
                hasChildren
            })}

    <div class="directory-item-container">
        <button
            class="folder"
            type="button"
            style={paddingLeftStyle}
            on:click={() => {
                if (radioInputs[i]) radioInputs[i].checked = true;
                onSelect?.({ title, fullPath, hasChildren });
            }}
            {...__MELTUI_BUILDER_0__} use:__MELTUI_BUILDER_0__.action
        >
            <Layout.Stack direction="row" justifyContent="space-between">
                <Layout.Stack
                    direction="row"
                    justifyContent="flex-start"
                    gap="xxs"
                    alignItems="center"
                >
                    <div>
                        <Layout.Stack direction="row" gap="xxs" alignItems="center">
                            <Radio
                                group="directory"
                                name="directory"
                                size="s"
                                bind:value
                                bind:radioInput={radioInputs[i]}
                            />
                            <div
                                class:folder-open={$isExpanded(fullPath)}
                                class:disabled={!hasChildren}
                                class="chevron-container"
                            >
                                <Icon
                                    icon={IconChevronRight}
                                    size="s"
                                    color="--fgcolor-neutral-tertiary"
                                />
                            </div>
                        </Layout.Stack>
                    </div>
                    <span
                        class="title"
                        style={containerWidth
                            ? `max-width: ${containerWidth - 100 - level * 40}px`
                            : ''}>{title}</span
                    >
                    {#if fileCount !== undefined}
                        <div class="fileCount">
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary"
                                >({fileCount} files)</Typography.Text
                            >
                        </div>
                    {/if}
                </Layout.Stack>
                {#if showThumbnail}
                    {#if loading || (thumbnailStates[i]?.loading && !thumbnailIcon && !thumbnailHtml)}
                        <Spinner />
                    {/if}

                    {#if thumbnailStates[i]?.error}
                        <div class="thumbnail-fallback" />
                    {:else if thumbnailUrl}
                        <img
                            src={thumbnailUrl}
                            alt="Directory thumbnail"
                            class="thumbnail"
                            class:hidden={thumbnailStates[i]?.loading}
                            on:load={() => handleThumbnailLoad(i)}
                            on:error={() => handleThumbnailError(i)}
                        />
                    {:else if thumbnailIcon}
                        <div class="thumbnail">
                            <Icon icon={thumbnailIcon} size="l" />
                        </div>
                    {:else if thumbnailHtml}
                        <div class="thumbnail">
                            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                            {@html thumbnailHtml}
                        </div>
                    {/if}
                {/if}
            </Layout.Stack>
        </button>

        {#if children}
            <div {...__MELTUI_BUILDER_1__} use:__MELTUI_BUILDER_1__.action>
                <svelte:self
                    directories={children}
                    level={level + 1}
                    {containerWidth}
                    {selectedPath}
                    {onSelect}
                />
            </div>
        {/if}
    </div>
{/each}

<style>
    .directory-item-container {
        width: 100%;
    }
    .folder {
        display: flex;
        width: 100%;
        flex-direction: row;
        padding: var(--space-3, 6px) var(--space-4, 8px);
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

        &:hover,
        &:focus {
            border-radius: var(--border-radius-s, 8px);
            background: var(--bgcolor-neutral-secondary, #f4f4f7);
        }
    }
    .chevron-container {
        width: var(--space-7);
        height: var(--space-7);
        transition: transform ease-in-out 0.1s;
    }
    .folder-open {
        transform: rotate(90deg);
    }
    .disabled {
        color: var(--fgcolor-neutral-tertiary);
    }

    .title {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex-grow: 0;
    }

    .fileCount {
        display: none;

        @media (min-width: 1024px) {
            display: block;
        }
    }

    .hidden {
        display: none;
    }

    .thumbnail {
        width: var(--icon-size-l, 24px);
        height: var(--icon-size-l, 24px);
        flex-shrink: 0;
        border-radius: var(--border-radius-circle, 99999px);
    }

    .thumbnail-fallback {
        width: var(--icon-size-l, 24px);
        height: var(--icon-size-l, 24px);
        flex-shrink: 0;
        border-radius: var(--border-radius-circle, 99999px);
        border: var(--border-width-s, 1px) dashed var(--border-neutral-strong, #d8d8db);
        background: var(--bgcolor-neutral-primary, #fff);
    }
</style>
