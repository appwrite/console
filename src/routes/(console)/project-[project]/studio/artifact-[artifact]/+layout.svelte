<script lang="ts">
    import { Layout, Divider, Icon, Button, Status } from '@appwrite.io/pink-svelte';
    import { page } from '$app/state';
    import { ActionDropdown, Tab, Tabs, Terminal } from '$lib/components';
    import { base } from '$app/paths';
    import { isSmallViewport } from '$lib/stores/viewport';
    import {
        IconChevronDoubleDown,
        IconChevronDoubleUp,
        IconPlusSm,
        IconTerminal,
        IconPlus
    } from '@appwrite.io/pink-icons-svelte';
    import { previewFrameRef } from '$routes/(console)/project-[project]/store';
    import {
        disableBodySelect,
        enabledBodySelect,
        getTerminalHeightFromPrefs,
        getTerminalOpenFromPrefs,
        saveTerminalHeightToPrefs,
        saveTerminalOpenToPrefs
    } from '$lib/helpers/studioLayout';
    import { showChat } from '$lib/stores/chat';
    import { default as IconChatLayout } from '../assets/chat-layout.svelte';
    import { default as IconImagine } from '../assets/icon-imagine.svelte';
    import { createArtifact } from '$lib/helpers/artifact';
    import Code from './code.svelte';
    import { studio } from '$lib/components/studio/studio.svelte';
    import { untrack } from 'svelte';
    import Debug from './debug.svelte';
    import ArtifactActionMenu from './artifactActionMenu.svelte';

    const { children, data } = $props();

    let view: 'preview' | 'editor' = $state(
        page.url.searchParams.has('code') ? 'editor' : 'preview'
    );

    let debug = $state(false);

    function changeView(newView: 'preview' | 'editor') {
        view = newView;
    }

    $effect(() => {
        const { artifact } = page.params;
        untrack(() => studio.selectArtifact(artifact));
    });

    let terminalOpen = $state(getTerminalOpenFromPrefs());
    let isResizing = false;

    const minHeight = 150;
    let resizerTopPosition = $state(getTerminalHeightFromPrefs() ?? minHeight);
    const terminalTabsHeight = 50;
    let layoutElement = $state<HTMLDivElement | null>(null);

    let editorHeight = $derived(resizerTopPosition + 1);
    let terminalHeight = $derived(
        layoutElement ? layoutElement.offsetHeight - resizerTopPosition - terminalTabsHeight : 0
    );

    $effect(() => {
        if (terminalOpen !== undefined) {
            saveTerminalOpenToPrefs(terminalOpen);
        }
    });

    function recalculateHeights() {
        if (terminalOpen === false) {
            editorHeight = layoutElement.offsetHeight - 46;
        } else if (terminalOpen) {
            editorHeight = resizerTopPosition + 1;
            terminalHeight = layoutElement.offsetHeight - resizerTopPosition - terminalTabsHeight;
        }
    }
    $effect(() => {
        recalculateHeights();
    });

    function startResize() {
        isResizing = true;
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);
        window.addEventListener('touchmove', resize);
        window.addEventListener('touchend', stopResize);
        disableBodySelect();
        if ($previewFrameRef) {
            $previewFrameRef.style.pointerEvents = 'none';
        }
    }

    function resize(event: MouseEvent | TouchEvent) {
        if (!isResizing) return;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;
        const relativeY = clientY - 50;
        const maxHeight = window.innerHeight - 200;
        if (relativeY < minHeight) {
            resizerTopPosition = minHeight;
        } else if (relativeY > maxHeight) {
            resizerTopPosition = maxHeight;
        } else {
            resizerTopPosition = relativeY;
        }
    }

    function stopResize() {
        isResizing = false;
        saveTerminalHeightToPrefs(resizerTopPosition);
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
        window.removeEventListener('touchmove', resize);
        window.removeEventListener('touchend', stopResize);
        enabledBodySelect();
        if ($previewFrameRef) {
            $previewFrameRef.style.pointerEvents = '';
        }
    }

    function createTerminal() {
        studio.createTerminal();
        if (studio.terminals.size > 1) {
            terminalOpen = true;
        }
    }

    const artifacts = $derived.by(() => {
        const mappedArtifacts = data.artifacts?.artifacts
            ? data.artifacts.artifacts.map((artifact) => {
                  return {
                      name: artifact.name,
                      isActive: page.params.artifact === artifact.$id,
                      href: `${base}/project-${page.params.project}/studio/artifact-${artifact.$id}`
                  };
              })
            : [];
        return mappedArtifacts;
    });

    $effect(() => {
        if (view === 'editor' && studio.terminals.size === 0) {
            createTerminal();
        }
    });

    function onViewportResize() {
        recalculateHeights();
    }
</script>

{#snippet artifactSelector()}
    {#if page.data.artifacts?.artifacts}
        <ActionDropdown
            items={artifacts}
            hasSearch
            bottomItems={[
                {
                    name: 'Create artifact',
                    href: undefined,
                    isActive: false,
                    onClick: () => {
                        createArtifact();
                    },
                    icon: IconPlus
                }
            ]} />
    {/if}
{/snippet}

<svelte:window on:resize={onViewportResize} />
<div bind:this={layoutElement} class="layout">
    <Layout.Stack
        direction="column"
        height={$isSmallViewport ? 'calc(100dvh - 119px)' : 'calc(100dvh - 79px)'}
        gap="none">
        <Layout.Stack direction="column" gap="none">
            {#if $isSmallViewport}
                <Layout.Stack direction="row" gap="none" justifyContent="center">
                    <div>
                        {@render artifactSelector()}
                    </div>
                </Layout.Stack>
                <div class="divider-wrapper-artifacts">
                    <Divider />
                </div>
            {/if}
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <Layout.Stack gap="xxs" direction="row" alignItems="center" inline>
                    {#if !$showChat}
                        <Button.Button
                            variant="compact"
                            style="--p-button-padding-block:0; margin-inline-start: -2px; margin-inline-end: 4px; color:var(--fgcolor-neutral-tertiary)"
                            on:click={() => {
                                showChat.set(true);
                            }}><Icon icon={IconChatLayout} size="l"></Icon></Button.Button>
                    {/if}
                    <Tabs>
                        <Tab
                            selected={view === 'preview'}
                            on:click={() => {
                                changeView('preview');
                            }}>Preview</Tab>
                        <Tab
                            selected={view === 'editor'}
                            on:click={() => {
                                changeView('editor');
                            }}>Code</Tab>
                    </Tabs>
                </Layout.Stack>
                {#if !$isSmallViewport}
                    {@render artifactSelector()}
                {/if}

                <Layout.Stack gap="s" direction="row" alignItems="center" inline>
                    <ArtifactActionMenu />
                    <Button.Button size="s" variant="primary">Release</Button.Button>
                </Layout.Stack>
            </Layout.Stack>
            <div class="divider-wrapper">
                <Divider />
            </div>
        </Layout.Stack>
        <div style:display={view === 'preview' ? 'contents' : 'none'}>
            {@render children()}
        </div>
        <div style:display={view === 'editor' ? 'contents' : 'none'}>
            <div class="code-container" style:height={editorHeight - 50 + 'px'}>
                <Code />
            </div>
        </div>
        <Debug bind:show={debug} />
        <div style:display={view === 'editor' ? 'contents' : 'none'}>
            {#if terminalOpen}
                <div
                    class="resizer"
                    role="presentation"
                    style:top={`${resizerTopPosition}px`}
                    onmousedown={startResize}
                    ontouchmove={startResize}>
                </div>
            {:else}
                <div class="absolute-border"></div>
            {/if}
            <aside style:top={`${terminalOpen ? editorHeight + 4 : editorHeight}px`}>
                <details bind:open={terminalOpen}>
                    <summary
                        onclick={(event) => {
                            event.preventDefault();
                        }}>
                        <div class="terminal-tabs">
                            <Layout.Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center">
                                <Layout.Stack direction="row" gap="s">
                                    <Tabs let:root>
                                        <Tab
                                            {root}
                                            selected={studio.activeTerminal ===
                                                studio.mainTerminalId}
                                            on:click={() => {
                                                studio.activeTerminal = studio.mainTerminalId;
                                                terminalOpen = true;
                                            }}>
                                            <Icon icon={IconImagine} />
                                            Imagine
                                        </Tab>
                                        {#each studio.terminals as [symbol] (symbol)}
                                            <Tab
                                                {root}
                                                on:click={() => (studio.activeTerminal = symbol)}
                                                selected={studio.activeTerminal === symbol}>
                                                <Icon icon={IconTerminal} />
                                                Terminal
                                            </Tab>
                                        {/each}
                                    </Tabs>
                                    <Button.Button
                                        variant="text"
                                        size="s"
                                        on:click={(event) => {
                                            event.preventDefault();
                                            createTerminal();
                                        }}
                                        icon>
                                        <Icon
                                            icon={IconPlusSm}
                                            size="m"
                                            color="--fgcolor-neutral-tertiary" />
                                    </Button.Button>
                                </Layout.Stack>
                                <Button.Button
                                    variant="compact"
                                    onclick={() => {
                                        terminalOpen = !terminalOpen;
                                    }}>
                                    <Icon
                                        icon={terminalOpen
                                            ? IconChevronDoubleDown
                                            : IconChevronDoubleUp}
                                        color="--fgcolor-neutral-tertiary" />
                                </Button.Button>
                            </Layout.Stack>
                        </div>
                    </summary>

                    {#key page.params.artifact}
                        <div
                            style:display={studio.activeTerminal === studio.mainTerminalId
                                ? 'contents'
                                : 'none'}>
                            <Terminal
                                height={terminalHeight}
                                synapse={studio.synapse}
                                focus={studio.activeTerminal === studio.mainTerminalId}></Terminal>
                        </div>
                    {/key}
                    {#each studio.terminals as [symbol, synapse] (symbol)}
                        <div style:display={studio.activeTerminal === symbol ? 'contents' : 'none'}>
                            <Terminal
                                height={terminalHeight}
                                {synapse}
                                focus={studio.activeTerminal === symbol}></Terminal>
                        </div>
                    {/each}
                </details>
            </aside>
        </div>
    </Layout.Stack>
</div>

<style lang="scss">
    .layout {
        position: relative;
    }
    aside {
        background-color: var(--bgcolor-neutral-default);

        margin-inline-start: -9px;
        margin-block-end: 0;

        width: 100%;

        position: absolute;
        bottom: 67px;

        @media (min-width: 768px) {
            width: calc(100% + 2 * var(--space-7) - 1px);
            margin-inline-start: -15px;
            border-bottom-right-radius: var(--border-radius-m);
        }
    }

    .absolute-border {
        position: absolute;
        margin-inline-start: calc(-1 * var(--space-7));
        width: calc(100% + 2 * var(--space-7));
        z-index: 1;
        bottom: 46px;
        &::after {
            content: '';
            position: absolute;
            height: 1px;
            width: 100%;
            background-color: var(--border-neutral);
        }
    }

    .resizer {
        position: absolute;
        height: 16px;
        cursor: row-resize;
        margin-inline-start: calc(-1 * var(--space-7));
        width: calc(100% + 2 * var(--space-7));
        z-index: 1;

        &::after {
            content: '';
            cursor: row-resize;
            position: absolute;
            height: 1px;
            width: 100%;
            background-color: var(--border-neutral);
            opacity: 1;
            transition: all 0.3s ease-in-out;
        }

        &:hover::after {
            height: 2px;
            background-color: var(--border-neutral-strong);
        }
    }
    .terminal-tabs {
        background-color: var(--bgcolor-neutral-primary);
        padding: var(--space-2) var(--space-7);
        margin-inline-start: calc(-1 * var(--space-1) + 1px);
        width: calc(100%);
    }

    .divider-wrapper-artifacts {
        margin-block-start: 8px;
        margin-block-end: 8px;
        margin-inline-start: calc(-1 * var(--space-4));
        width: calc(100% + var(--space-7));
    }

    .divider-wrapper {
        margin-block-start: 7.5px;
        margin-block-end: 8px;
        margin-inline-start: calc(-1 * var(--space-4));
        width: calc(100% + var(--space-7));

        @media (min-width: 768px) {
            margin-inline-start: calc(-1 * var(--space-7));
            width: calc(100% + var(--space-10));
        }
    }

    .code-container {
        @media (min-width: 768px) {
            margin-inline-start: calc(-1 * var(--space-7));
            width: calc(100% + 2 * var(--space-7));
        }
    }

    .hide-mobile {
        display: none;
        @media (min-width: 768px) {
            display: block;
        }
    }
</style>
