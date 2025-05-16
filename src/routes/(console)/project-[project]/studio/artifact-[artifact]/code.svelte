<script lang="ts">
    import Editor from '$lib/components/editor/editor.svelte';
    import Filesystem from '$lib/components/editor/filesystem.svelte';
    import { studio } from '$lib/components/studio/studio.svelte';
    import type { SyncWorkDirData } from '$lib/components/studio/synapse.svelte';

    let instance: Editor;
    let currentFile: string = $state(null);

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
</script>

<main>
    <Filesystem
        files={studio.filesystem}
        onopenfile={openFile}
        onopenfolder={(path) => studio.loadFolder(path)} />
    <Editor bind:this={instance} onsave={saveFile} />
</main>

<style lang="scss">
    main {
        height: 100%;
        display: grid;
        grid-template-columns: 25% 75%;
    }
</style>
