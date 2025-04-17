<script lang="ts">
    import { Layout, Card, Typography, Divider, Icon } from '@appwrite.io/pink-svelte';
    import { isTabSelected } from '$lib/helpers/load';
    import { page } from '$app/state';
    import { Tab, Tabs, Terminal } from '$lib/components';
    import { base } from '$app/paths';
    import { isSmallViewport } from '$lib/stores/viewport';
    import {
        IconChevronDoubleUp,
        IconDeviceMobile,
        IconExternalLink,
        IconRefresh,
        IconTerminal
    } from '@appwrite.io/pink-icons-svelte';
    import { InputText } from '$lib/elements/forms';
    import { artifacts } from '$routes/(console)/project-[project]/store';

    const projectId = page.params.project;
    let selectedArtifact = $derived(
        $artifacts.find((artifact) => page.params.artifact === artifact.$id)
    );
    let frameUrl = $derived.by(() => {
        return selectedArtifact.previewUrl;
    });
    console.log('frameUrl', frameUrl);
    const path = `${base}/project-${projectId}/studio`;
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

    let terminalOpen = $state(false);
    let asideRef;
    let isResizing = false;
    let terminalHeight = $state(300);

    function startResize(event) {
        isResizing = true;
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);
        window.addEventListener('touchmove', resize);
        window.addEventListener('touchend', stopResize);
        document.body.style.userSelect = 'none';
        document.getElementById('preview-iframe').style.pointerEvents = 'none';
    }

    function resize(event) {
        if (!isResizing) return;

        const clientY = event.touches ? event.touches[0].clientY : event.clientY;
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
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
        window.removeEventListener('touchmove', resize);
        window.removeEventListener('touchend', stopResize);
        document.body.style.userSelect = '';
        document.getElementById('preview-iframe').style.pointerEvents = '';
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
    <aside bind:this={asideRef}>
        <details bind:open={terminalOpen}>
            <summary
                on:mousedown={startResize}
                on:touchmove={startResize}
                class:terminal-slider={terminalOpen}>
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
    .iframe-container {
        height: calc(100vh - 296px);

        @media (min-width: 768px) {
            flex-grow: 1;
            height: auto;
        }
    }
    iframe {
        border: none;
        width: calc(100% + 2 * var(--space-9));
        height: 100%;
        margin-inline-start: calc(-1 * var(--space-9));
    }

    .terminal-slider {
        cursor: row-resize;
    }
</style>
