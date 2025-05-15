<script lang="ts">
    import Editor from '$lib/components/editor/editor.svelte';
    import { filesystem } from '$lib/components/editor/filesystem';
    import Filesystem from '$lib/components/editor/filesystem.svelte';
    import { synapse } from '$lib/components/studio/synapse.svelte';

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

    async function openFile(path: string) {
        const message = await synapse.dispatch('fs', {
            operation: 'getFile',
            params: {
                filepath: path
            }
        });
        instance?.loadCode(message.data as string, getLanguageFromExtensions(path));
        currentFile = path;
    }

    async function openFolder(path: string) {
        const message = await synapse.dispatch('fs', {
            operation: 'getFolder',
            params: {
                folderpath: path
            }
        });
        const data = message.data as Array<{ name: string; isDirectory: boolean }>;
        if (!Array.isArray(data)) return;
        for (const { name, isDirectory } of data) {
            const key = isDirectory ? name + '/' : name;
            filesystem.update((n) => {
                n.push(path + '/' + key);
                console.log(path + '/' + key);
                return n;
            });
        }
    }

    async function saveFile(content: string) {
        await synapse.dispatch('fs', {
            operation: 'updateFile',
            params: {
                content,
                filepath: currentFile
            }
        });
    }
</script>

<main>
    <Filesystem files={$filesystem} onopenfile={openFile} onopenfolder={openFolder} />
    <Editor bind:this={instance} onsave={saveFile} />
</main>

<style lang="scss">
    main {
        height: 50vh;
        display: grid;
        grid-template-columns: 25% 75%;
    }
</style>
