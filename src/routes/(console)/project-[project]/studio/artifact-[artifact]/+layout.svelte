<script lang="ts">
    import { Layout, Typography, Divider, Icon, Button } from '@appwrite.io/pink-svelte';
    import { isTabSelected } from '$lib/helpers/load';
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
    import {
        createSynapse,
        endpoint,
        Synapse,
        synapse
    } from '$lib/components/studio/synapse.svelte';
    import { showChat } from '$lib/stores/chat';
    import { default as IconChatLayout } from '../assets/chat-layout.svelte';
    import { default as IconImagine } from '../assets/icon-imagine.svelte';
    import { filesystem } from '$lib/components/editor/filesystem';
    import { InputSelect } from '$lib/elements/forms/index.js';
    import { SvelteMap } from 'svelte/reactivity';
    import { createArtifact } from '$lib/helpers/artifact';

    const { children } = $props();

    const path = $derived(
        `${base}/project-${page.params.project}/studio/artifact-${page.params.artifact}`
    );
    const tabs = $derived([
        {
            href: path,
            title: 'Preview',
            event: 'preview',
            hasChildren: true
        },
        {
            href: `${path}/code`,
            title: 'Code',
            event: 'code',
            hasChildren: true
        }
    ]);
    const mainTerminalId = Symbol();
    const terminals = new SvelteMap<symbol, Synapse>();
    let currentTerminal: symbol = $state(mainTerminalId);
    synapse
        .dispatch(
            'synapse',
            {
                operation: 'updateWorkDir',
                params: {
                    workDir: `/artifact/${page.params.artifact}`
                }
            },
            {
                noReturn: true
            }
        )
        .then(() => {
            return synapse.dispatch('fs', {
                operation: 'getFolder',
                params: {
                    folderpath: `.`
                }
            });
        })
        .then((message) => {
            const data = message.data as Array<{ name: string; isDirectory: boolean }>;
            if (!Array.isArray(data)) return;
            for (const { name, isDirectory } of data) {
                const key = isDirectory ? name + '/' : name;
                filesystem.update((n) => {
                    n.push(key);

                    return n;
                });
            }
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
        const symbol = Symbol();
        terminals.set(symbol, createSynapse(endpoint, page.params.artifact));
        currentTerminal = symbol;
        terminalOpen = true;
    }

    let artifacts = $derived.by(() => {
        const mappedArtifacts = page.data.artifacts?.artifacts
            ? page.data.artifacts.artifacts.map((artifact) => {
                  return {
                      name: artifact.name,
                      isActive: page.params.artifact === artifact.$id,
                      href: `${base}/project-${page.params.project}/studio/artifact-${artifact.$id}`
                  };
              })
            : [];

        mappedArtifacts.push({
            name: 'Create artifact',
            isActive: false,
            onClick: () => {
                createArtifact();
            },
            icon: IconPlus
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
    height={$isSmallViewport ? 'calc(100vh - 119px)' : 'calc(100vh - 76px)'}
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
                    {#each tabs as tab}
                        <Tab
                            href={tab.href}
                            selected={isTabSelected(tab, page.url.pathname, path, tabs)}
                            event={tab.event}>
                            {tab.title}
                        </Tab>
                    {/each}
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
    {@render children()}
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
                                variant="compact"
                                size="s"
                                on:click={(event) => {
                                    console.log('clicked');
                                    event.preventDefault();
                                    createTerminal();
                                }}>
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

            <div style:display={currentTerminal === mainTerminalId ? 'contents' : 'none'}>
                <Terminal height={terminalHeight} {synapse}></Terminal>
            </div>
            {#each terminals as [symbol, synapse] (symbol)}
                <div style:display={currentTerminal === symbol ? 'contents' : 'none'}>
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
