<script lang="ts">
    import Editor from '$lib/components/editor/editor.svelte';
    import Filesystem from '$lib/components/editor/filesystem.svelte';
    import { studio } from '$lib/components/studio/studio.svelte';

    let instance: Editor;
    let currentFile: string = $state(null);

    function getLanguageFromExtensions(path: string) {
        switch (true) {
            case path.endsWith('.md'):
                return 'markdown';
            case path.endsWith('.js'):
            case path.endsWith('.jsx'):
                return 'javascript';
            case path.endsWith('.ts'):
            case path.endsWith('.tsx'):
                return 'typescript';
            case path.endsWith('.svg'):
            case path.endsWith('.html'):
                return 'html';
            case path.endsWith('.css'):
                return 'css';
            case path.endsWith('.json'):
                return 'json';
            default:
                return null;
        }
    }

    studio.synapse.addEventListener('syncWorkDir', ({ message }) => {
        const { path, content } = message.success as unknown as { path: string; content: string };
        currentFile = path;
        instance?.openFile(content as string, path);
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
