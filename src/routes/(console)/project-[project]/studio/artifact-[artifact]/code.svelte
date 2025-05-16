<script lang="ts">
    import Editor from '$lib/components/editor/editor.svelte';
    import Filesystem from '$lib/components/editor/filesystem.svelte';
    import { studio } from '$lib/components/studio/studio.svelte';
    import type { SyncWorkDirData } from '$lib/components/studio/synapse.svelte';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { disableBodySelect, enabledBodySelect } from '$lib/helpers/studioLayout';
    import { throttle } from '$lib/helpers/functions';
    import { onDestroy, onMount } from 'svelte';

    let instance: Editor;
    let currentFile: string = $state(null);
    let resizerLeftPosition = $state(250);
    let mainRef;

    studio.synapse.addEventListener('syncWorkDir', ({ message }) => {
        const { path, content, event } = message.data as SyncWorkDirData;
        if (event !== 'create' && event !== 'change') return;
        currentFile = path;
        instance?.openFile(content, path);
    });

    async function openFile(path: string) {
        const message = await studio.synapse.dispatch('fs', {
            operation: 'getFile',
            params: {
                filepath: path
            }
        });
        instance?.openFile(message.data as string, path);
        currentFile = path;
    }

    async function saveFile(content: string) {
        await studio.synapse.dispatch('fs', {
            operation: 'updateFile',
            params: {
                content,
                filepath: currentFile
            }
        });
    }

    let resizer = $state(null);
    let isResizing = $state(false);
    let resizeObserver;

    let containerX = $state<null | number>(null);
    let maxContainerX = $state<null | number>(null);

    function checkParentDimensions(force = false) {
        if ((resizer && !containerX) || containerX === 0 || force) {
            containerX = resizer.parentElement.getBoundingClientRect().x;
            maxContainerX = resizer.parentElement.getBoundingClientRect().width;
        }
    }

    $effect(() => {
        checkParentDimensions();
    });

    function startResize() {
        checkParentDimensions();
        isResizing = true;
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);
        window.addEventListener('touchmove', resize);
        window.addEventListener('touchend', stopResize);
        disableBodySelect();
    }

    function resize(event: TouchEvent | MouseEvent) {
        if (!isResizing) return;
        if (resizer) {
            const clientX =
                ('touches' in event ? event.touches[0].clientX : event.clientX) - containerX;

            const maxSize = maxContainerX - 200;

            const minSize = 150;
            if (clientX > maxSize) {
                resizerLeftPosition = maxSize;
            } else if (clientX < minSize) {
                resizerLeftPosition = minSize;
            } else {
                resizerLeftPosition = clientX;
            }
        }
    }

    function stopResize() {
        isResizing = false;
        window.removeEventListener('mousemove', resize);
        window.removeEventListener('mouseup', stopResize);
        window.removeEventListener('touchmove', resize);
        window.removeEventListener('touchend', stopResize);
        enabledBodySelect();
    }

    onMount(() => {
        resizeObserver = new ResizeObserver(() => {
            checkParentDimensions(true);
        });

        if (mainRef) {
            resizeObserver.observe(mainRef);
        }
    });

    onDestroy(() => {
        if (resizeObserver) {
            resizeObserver.disconnect();
        }
    });
</script>

<main bind:this={mainRef}>
    <Layout.Stack direction="row" height="100%" gap="none">
        <div class="filesystem" style:width={resizerLeftPosition + 'px'}>
            <Filesystem
                files={studio.filesystem}
                onopenfile={openFile}
                onopenfolder={(path) => studio.loadFolder(path)} />
        </div>
        <div
            class="resizer"
            role="presentation"
            style:left={resizerLeftPosition + 'px'}
            bind:this={resizer}
            onmousedown={startResize}
            ontouchmove={startResize}>
        </div>
        <div class="editor">
            <Editor bind:this={instance} onsave={saveFile} />
        </div>
    </Layout.Stack>
</main>

<style lang="scss">
    main {
        height: 100%;
        position: relative;
    }

    .editor {
        flex-grow: 1;
        width: 0;
        height: calc(100% - 1px);
    }

    .resizer {
        width: 16px;
        cursor: col-resize;
        margin-inline: 10px;
        position: absolute;
        height: calc(100% + var(--space-4));
        margin-block-start: calc(-1 * var(--base-8));
        margin-inline-start: -8px;
        z-index: 1;

        &::after {
            content: '';
            cursor: col-resize;
            position: absolute;
            height: 100%;
            width: 1px;
            margin-left: -1px;
            left: 8px;
            background-color: var(--border-neutral);
            opacity: 1;
            transition: all 0.3s ease-in-out;
        }

        &:hover::after {
            width: 2px;
            background-color: var(--border-neutral-strong);
        }
    }
</style>
