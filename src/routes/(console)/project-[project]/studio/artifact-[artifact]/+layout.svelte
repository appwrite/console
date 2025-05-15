<script lang="ts">
    import { Layout, Typography, Divider, Icon, Button } from '@appwrite.io/pink-svelte';
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
        getChatWidthFromPrefs,
        getTerminalHeightFromPrefs,
        getTerminalOpenFromPrefs,
        saveTerminalHeightToPrefs,
        saveTerminalOpenToPrefs
    } from '$lib/helpers/studioLayout';
    import { createSynapse, endpoint, synapse } from '$lib/components/studio/synapse.svelte';
    import { showChat } from '$lib/stores/chat';
    import { default as IconChatLayout } from '../assets/chat-layout.svelte';
    import { default as IconImagine } from '../assets/icon-imagine.svelte';
    import { filesystem } from '$lib/components/editor/filesystem';
    import { SvelteMap } from 'svelte/reactivity';
    import { createArtifact } from '$lib/helpers/artifact';
    import { untrack } from 'svelte';
    import Code from './code.svelte';

    const { children, data } = $props();

    let view: 'preview' | 'editor' = $state('preview');
    const mainTerminalId = Symbol();
    const terminals = new SvelteMap<symbol, ReturnType<typeof createSynapse>>();
    let currentTerminal: symbol = $state(mainTerminalId);

    $effect(() => {
        const { artifact } = page.params;
        untrack(async () => {
            synapse.changeArtifact(endpoint, artifact);
            currentTerminal = mainTerminalId;
            for (const id of terminals.keys()) {
                if (id !== mainTerminalId) terminals.delete(id);
            }
            filesystem.set([]);
            await synapse.isConnected();
            const fs = await synapse.dispatch('fs', {
                operation: 'getFolder',
                params: {
                    folderpath: `.`
                }
            });
            const data = fs.data as Array<{ name: string; isDirectory: boolean }>;
            if (!Array.isArray(data)) return;
            for (const { name, isDirectory } of data) {
                const key = isDirectory ? name + '/' : name;
                filesystem.update((n) => {
                    n.push(key);

                    return n;
                });
            }
        });
    });

    let terminalOpen = $state(getTerminalOpenFromPrefs());
    let asideRef: HTMLElement;
    let isResizing = false;

    const minHeight = 350;
    let resizerTopPosition = $state(minHeight);
    const terminalTabsHeight = 50;
    let layoutElement = $state<HTMLDivElement | null>(null);

    let editorHeight = $derived(resizerTopPosition + 1);
    let terminalHeight = $derived(
        layoutElement.offsetHeight - resizerTopPosition - terminalTabsHeight
    );

    $effect(() => {
        if (terminalOpen !== undefined) {
            saveTerminalOpenToPrefs(terminalOpen);
        }
        if (terminalOpen === false) {
            editorHeight = layoutElement.offsetHeight - 46;
        } else if (terminalOpen) {
            editorHeight = resizerTopPosition + 1;
            terminalHeight = layoutElement.offsetHeight - resizerTopPosition - terminalTabsHeight;
        }
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
        const relativeY = clientY - 50; // y distance from top of card

        const maxHeight = window.innerHeight - 400;
        if (relativeY < minHeight) {
            resizerTopPosition = minHeight;
        } else if (relativeY > maxHeight) {
            resizerTopPosition = maxHeight;
        } else {
            resizerTopPosition = relativeY;
        }

        // let height =
        //     asideRef.getBoundingClientRect().y -
        //     clientY +
        //     asideRef.getBoundingClientRect().height -
        //     32;
        //
        // terminalHeight = height < maxHeight ? height : maxHeight;
    }

    function stopResize() {
        isResizing = false;
        saveTerminalHeightToPrefs(terminalHeight);
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
        const symbol = Symbol();
        terminals.set(symbol, createSynapse(endpoint, page.params.artifact));
        currentTerminal = symbol;
        terminalOpen = true;
    }

    const artifacts = $derived.by(() => {
        const mappedArtifacts = data.artifacts?.artifacts
            ? data.artifacts.artifacts.map((artifact) => {
                  return {
                      name: artifact.name,
                      isActive: page.params.artifact === artifact.$id,
                      href: `${base}/project-${page.params.project}/studio/artifact-${artifact.$id}`,
                      type: 'item'
                  };
              })
            : [];

        mappedArtifacts.push({
            type: 'divider'
        });
        mappedArtifacts.push({
            name: 'Create artifact',
            href: undefined,
            isActive: false,
            onClick: () => {
                createArtifact();
            },
            icon: IconPlus,
            type: 'item'
        });
        return mappedArtifacts;
    });

    $effect(() => {
        if (view === 'editor' && terminals.size === 0) {
            createTerminal();
        }
    });
</script>

{#snippet artifactSelector()}
    {#if page.data.artifacts?.artifacts}
        <ActionDropdown items={artifacts} />
    {/if}
{/snippet}

<div bind:this={layoutElement} class="layout">
    <Layout.Stack
        direction="column"
        height={$isSmallViewport ? 'calc(100vh - 119px)' : 'calc(100vh - 79px)'}
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
                                view = 'preview';
                            }}>Preview</Tab>
                        <Tab
                            selected={view === 'editor'}
                            on:click={() => {
                                view = 'editor';
                            }}>Code</Tab>
                    </Tabs>
                </Layout.Stack>
                {#if !$isSmallViewport}
                    {@render artifactSelector()}
                {/if}

                <Layout.Stack gap="s" direction="row" alignItems="center" inline>
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
        {#if view === 'editor'}
            {#if terminalOpen}
                <div
                    class="resizer"
                    role="presentation"
                    style:top={`${resizerTopPosition}px`}
                    onmousedown={startResize}
                    ontouchmove={startResize} />
            {/if}
            <aside bind:this={asideRef} style:top={`${editorHeight}px`}>
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
                                            selected={currentTerminal === mainTerminalId}
                                            on:click={() => {
                                                currentTerminal = mainTerminalId;
                                                terminalOpen = true;
                                            }}>
                                            <Icon icon={IconImagine} />
                                            Imagine
                                        </Tab>
                                        {#each terminals as [symbol] (symbol)}
                                            <Tab
                                                {root}
                                                on:click={() => (currentTerminal = symbol)}
                                                selected={currentTerminal === symbol}>
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
                            style:display={currentTerminal === mainTerminalId
                                ? 'contents'
                                : 'none'}>
                            <Terminal height={terminalHeight} {synapse}></Terminal>
                        </div>
                    {/key}
                    {#each terminals as [symbol, synapse] (symbol)}
                        <div style:display={currentTerminal === symbol ? 'contents' : 'none'}>
                            <Terminal height={terminalHeight} {synapse}></Terminal>
                        </div>
                    {/each}
                </details>
            </aside>
        {/if}
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
            width: calc(100% + 2 * var(--space-7));
            margin-inline-start: -15px;
            border-bottom-right-radius: var(--border-radius-m);
        }
    }

    //.terminal-slider {
    //    cursor: row-resize;
    //    border-top: 1px solid var(--border-neutral);
    //    transition: all 0.2s ease-in-out;
    //
    //    &:hover {
    //        border-top: 2px solid var(--border-neutral-strong);
    //        background-color: var(--border-neutral-strong);
    //    }
    //}

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
</style>
