<script lang="ts">
    import { Layout, Typography, Divider, Icon } from '@appwrite.io/pink-svelte';
    import { isTabSelected } from '$lib/helpers/load';
    import { page } from '$app/state';
    import { Tab, Tabs, Terminal } from '$lib/components';
    import { base } from '$app/paths';
    import { isSmallViewport } from '$lib/stores/viewport';
    import { IconChevronDoubleUp, IconTerminal } from '@appwrite.io/pink-icons-svelte';
    import { previewFrameRef } from '$routes/(console)/project-[project]/store';
    import type { Terminal as XTerm } from '@xterm/xterm';
    import {
        getTerminalHeightFromPrefs,
        getTerminalOpenFromPrefs,
        saveTerminalHeightToPrefs,
        saveTerminalOpenToPrefs
    } from '$lib/helpers/studioLayout';
    import { synapse } from '$lib/components/studio/synapse.svelte';

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
</script>

<Layout.Stack
    direction="column"
    height={$isSmallViewport ? 'calc(100vh - 218px)' : 'calc(100vh - 120px)'}
    gap="none">
    <Layout.Stack direction="column">
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
        <Divider />
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
            <Terminal height={terminalHeight} {synapse}></Terminal>
        </details>
    </aside>
</Layout.Stack>

<style>
    aside {
        background-color: var(--bgcolor-neutral-default);

        margin-inline-start: -25px;
        margin-block-end: calc(-1 * var(--space-9));
        padding: var(--space-3);
        border-bottom-left-radius: var(--border-radius-m);
        border-bottom-right-radius: var(--border-radius-m);

        border: 1px solid var(--border-neutral);
        width: calc(100% - var(--space-7));

        position: fixed;
        bottom: 116px;

        @media (min-width: 768px) {
            width: calc(100% + 2 * var(--space-9));
            margin-inline-start: calc(-1 * var(--space-9));
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
</style>
