<script lang="ts">
    import { Layout, Card, Typography, Divider, Icon } from '@appwrite.io/pink-svelte';
    import { isTabSelected } from '$lib/helpers/load';
    import { page } from '$app/state';
    import { Tab, Tabs, Terminal } from '$lib/components';
    import { base } from '$app/paths';
    import {
        IconChevronDoubleUp,
        IconDeviceMobile,
        IconExternalLink,
        IconRefresh,
        IconTerminal
    } from '@appwrite.io/pink-icons-svelte';
    import { InputText } from '$lib/elements/forms/index.js';

    const frameUrl = 'https://getbootstrap.com/docs/5.3/examples/blog/';

    const projectId = page.params.project;
    const path = `${base}/project-${projectId}/builder`;
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

    let terminalOpen;
    let asideRef;
    let isResizing = false;
    let terminalHeight = 300;

    function startResize(event) {
        isResizing = true;
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);
        document.body.style.userSelect = 'none';
        document.getElementById('preview-iframe').style.pointerEvents = 'none';
    }

    function resize(event) {
        if (!isResizing) return;

        terminalHeight =
            asideRef.getBoundingClientRect().y -
            event.clientY +
            asideRef.getBoundingClientRect().height -
            32;
    }

    function stopResize() {
        isResizing = false;
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
        document.body.style.userSelect = '';
        document.getElementById('preview-iframe').style.pointerEvents = '';
    }
</script>

<Layout.Stack direction="column" height="calc(100vh - 120px)" gap="none">
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
        <Layout.Stack direction="row" alignItems="center">
            <Icon icon={IconRefresh} color="--fgcolor-neutral-tertiary" />
            <InputText id="previewUrl" value={frameUrl} />
            <Icon icon={IconDeviceMobile} color="--fgcolor-neutral-tertiary" />
            <Icon icon={IconExternalLink} color="--fgcolor-neutral-tertiary" />
        </Layout.Stack>
        <div></div>
    </Layout.Stack>
    <div class="iframe-container">
        <iframe src={frameUrl} id="preview-iframe"></iframe>
    </div>
    <div></div>
    {#if terminalOpen}<div class="terminal-slider" on:mousedown={startResize}></div>
    {/if}
    <aside bind:this={asideRef}>
        <details bind:open={terminalOpen}>
            <summary>
                <Layout.Stack direction="row" justify="space-between">
                    <Layout.Stack direction="row" alignItems="center" gap="xs">
                        <Icon icon={IconTerminal} color="--fgcolor-neutral-tertiary" />
                        <Typography.Text>Terminal</Typography.Text>
                    </Layout.Stack>
                    <Icon icon={IconChevronDoubleUp} color="--fgcolor-neutral-tertiary" />
                </Layout.Stack>
            </summary>
            <Terminal bind:height={terminalHeight}></Terminal>
        </details>
    </aside>
</Layout.Stack>

<style>
    aside {
        background-color: var(--bgcolor-neutral-default);
        width: calc(100% + 2 * var(--space-9));
        margin-inline-start: calc(-1 * var(--space-9));
        margin-block-end: calc(-1 * var(--space-9));
        padding: var(--space-3);
        border-bottom-left-radius: var(--border-radius-m);
        border-bottom-right-radius: var(--border-radius-m);
    }
    summary {
        cursor: pointer;
    }
    .iframe-container {
        flex-grow: 1;
    }
    iframe {
        border: none;
        width: calc(100% + 2 * var(--space-9));
        height: 100%;
        margin-inline-start: calc(-1 * var(--space-9));
    }

    .terminal-slider {
        height: 4px;
        background-color: var(--bgcolor-neutral-default);
        width: calc(100% + 2 * var(--space-9));
        margin-inline-start: calc(-1 * var(--space-9));
        cursor: row-resize;
    }
</style>
