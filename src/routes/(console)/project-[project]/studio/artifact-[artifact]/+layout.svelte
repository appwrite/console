<script lang="ts">
    import {
        Layout,
        Typography,
        Divider,
        Icon,
        Button,
        ActionMenu
    } from '@appwrite.io/pink-svelte';
    import { isTabSelected } from '$lib/helpers/load';
    import { page } from '$app/state';
    import { Tab, Tabs, Terminal } from '$lib/components';
    import { base } from '$app/paths';
    import { isSmallViewport } from '$lib/stores/viewport';
    import {
        IconChevronDoubleUp,
        IconChevronDown,
        IconTerminal
    } from '@appwrite.io/pink-icons-svelte';
    import { previewFrameRef } from '$routes/(console)/project-[project]/store';
    import type { Terminal as XTerm } from '@xterm/xterm';
    import {
        getTerminalHeightFromPrefs,
        getTerminalOpenFromPrefs,
        saveTerminalHeightToPrefs,
        saveTerminalOpenToPrefs
    } from '$lib/helpers/studioLayout';
    import { endpoint, Synapse, synapse } from '$lib/components/studio/synapse.svelte';
    import { showChat } from '$lib/stores/chat';
    import { default as IconChatLayout } from '../assets/chat-layout.svelte';
    import { filesystem } from '$lib/components/editor/filesystem';
    import { InputSelect } from '$lib/elements/forms/index.js';
    import { SvelteMap } from 'svelte/reactivity';

    const { children } = $props();

    const projectId = page.params.project;
    const artifactId = page.params.artifact;

    const path = `${base}/project-${projectId}/studio/artifact-${artifactId}`;
    const tabs = [
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
    ];
    const mainTerminalId = Symbol();
    const terminals = new SvelteMap<symbol, Synapse>();
    let currentTerminal: symbol = $state(mainTerminalId);

    synapse.dispatch('synapse', {
        operation: 'updateWorkDir',
        params: {
            workdir: `/artifact/${artifactId}`
        }
    });
    synapse.dispatch('terminal', {
        operation: 'createCommand',
        params: {
            command: 'clear && history -c\n'
        }
    });
    synapse
        .dispatch('fs', {
            operation: 'getFolder',
            params: {
                folderpath: '.'
            }
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
        document.body.style.userSelect = 'none';
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
        document.body.style.userSelect = '';
        if ($previewFrameRef) {
            $previewFrameRef.style.pointerEvents = '';
        }
    }

    function createTerminal() {
        const symbol = Symbol();
        terminals.set(symbol, new Synapse(endpoint));
        currentTerminal = symbol;
    }
</script>

<Layout.Stack
    direction="column"
    height={$isSmallViewport ? 'calc(100vh - 218px)' : 'calc(100vh - 88px)'}
    gap="none">
    <Layout.Stack direction="column" gap="none">
        <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
            <Layout.Stack gap="xxs" direction="row" alignItems="center" inline>
                {#if !$showChat}
                    <Button.Button
                        variant="compact"
                        color="--fgcolor-neutral-secondary"
                        style="--p-button-padding-block:0"
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

            <ActionMenu.Item.Button trailingIcon={IconChevronDown}
                >Dashboard</ActionMenu.Item.Button>
            {#if !$isSmallViewport}
                <Layout.Stack gap="xxs" direction="row" alignItems="center" inline>
                    <InputSelect
                        id="artificat-version"
                        options={[
                            { value: '0.2', label: 'v0.2' },
                            { value: '0.1', label: 'v0.1' }
                        ]}
                        value="0.2" />
                    <Button.Button size="s" variant="primary">Release</Button.Button>
                </Layout.Stack>
            {/if}
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
                class:terminal-slider={terminalOpen}>
                <Layout.Stack direction="row" justify="space-between">
                    <Layout.Stack direction="row" alignItems="center" gap="xs">
                        <Icon icon={IconTerminal} color="--fgcolor-neutral-tertiary" />
                        <Typography.Text>Terminal</Typography.Text>
                    </Layout.Stack>
                    <Icon icon={IconChevronDoubleUp} color="--fgcolor-neutral-tertiary" />
                </Layout.Stack>
            </summary>
            <Layout.Stack>
                <Tabs let:root>
                    <Tab
                        {root}
                        selected={currentTerminal === mainTerminalId}
                        on:click={() => (currentTerminal = mainTerminalId)}>
                        Imagine
                    </Tab>
                    {#each terminals as [symbol] (symbol)}
                        <Tab
                            {root}
                            on:click={() => (currentTerminal = symbol)}
                            selected={currentTerminal === symbol}>
                            Terminal
                        </Tab>
                    {/each}
                    <Tab {root} on:click={createTerminal}>+</Tab>
                </Tabs>
            </Layout.Stack>
            <div style:display={currentTerminal === mainTerminalId ? 'contents' : 'none'}>
                <Terminal height={terminalHeight} {synapse} readonly></Terminal>
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

        margin-inline-start: -25px;
        margin-block-end: calc(-1 * var(--base-8));
        padding: var(--space-3);
        border-bottom-right-radius: var(--border-radius-m);

        border: 1px solid var(--border-neutral);
        width: calc(100% - var(--space-7));

        position: fixed;
        bottom: 116px;

        @media (min-width: 768px) {
            width: calc(100% + 2 * var(--space-7));
            margin-inline-start: calc(-1 * var(--space-7));
            position: static;
            border: 0;
        }
    }
    summary {
        cursor: pointer;
    }

    .terminal-slider {
        cursor: row-resize;
    }

    .divider-wrapper {
        margin-block-start: 7.5px;
        margin-inline-start: calc(-1 * var(--space-7));
        margin-block-end: 8px;
        width: calc(100% + var(--space-10));
    }
</style>
