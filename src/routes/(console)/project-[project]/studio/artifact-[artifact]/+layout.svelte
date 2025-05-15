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

    const { children, data } = $props();

    let view: 'preview' | 'editor' = $state('preview');

    $effect(() => {
        const { artifact } = page.params;
        untrack(() => studio.selectArtifact(artifact));
    });

    let terminalOpen = $state(getTerminalOpenFromPrefs());
    let asideRef: HTMLElement;
    let isResizing = false;
    let terminalHeight = $state(getTerminalHeightFromPrefs());

    $effect(() => {
        if (terminalOpen !== undefined) {
            saveTerminalOpenToPrefs(terminalOpen);
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
        const maxHeight = window.innerHeight - 400;

        let height =
            asideRef.getBoundingClientRect().y -
            clientY +
            asideRef.getBoundingClientRect().height -
            32;

        terminalHeight = height < maxHeight ? height : maxHeight;
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
        studio.createTerminal();
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
</script>

{#snippet artifactSelector()}
    {#if page.data.artifacts?.artifacts}
        <ActionDropdown items={artifacts} />
    {/if}
{/snippet}

<Layout.Stack
    direction="column"
    height={$isSmallViewport ? 'calc(100vh - 119px)' : 'calc(100vh - 74px)'}
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
        <Code />
    </div>
    <aside bind:this={asideRef}>
        <details bind:open={terminalOpen}>
            <summary
                onmousedown={startResize}
                ontouchmove={startResize}
                onclick={(event) => {
                    event.preventDefault();
                }}
                class:terminal-slider={terminalOpen}>
                <div class="terminal-tabs">
                    <Layout.Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center">
                        <Layout.Stack direction="row" gap="s">
                            <Tabs let:root>
                                <Tab
                                    {root}
                                    selected={studio.activeTerminal === studio.mainTerminalId}
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
                                icon={terminalOpen ? IconChevronDoubleDown : IconChevronDoubleUp}
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
                    <Terminal height={terminalHeight} synapse={studio.synapse}></Terminal>
                </div>
            {/key}
            {#each studio.terminals as [symbol, synapse] (symbol)}
                <div style:display={studio.activeTerminal === symbol ? 'contents' : 'none'}>
                    <Terminal height={terminalHeight} {synapse}></Terminal>
                </div>
            {/each}
        </details>
    </aside>
</Layout.Stack>

<style>
    aside {
        background-color: var(--bgcolor-neutral-default);

        margin-inline-start: -9px;
        margin-block-end: 0;

        width: 100%;

        position: fixed;
        bottom: 67px;

        @media (min-width: 768px) {
            width: calc(100% + 2 * var(--space-7));
            margin-inline-start: calc(-1 * var(--space-7));
            border-bottom-right-radius: var(--border-radius-m);
            position: static;
        }
    }

    .terminal-slider {
        cursor: row-resize;
        border-top: 1px solid var(--border-neutral);
        transition: all 0.2s ease-in-out;

        &:hover {
            border-top: 2px solid var(--border-neutral-strong);
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
</style>
