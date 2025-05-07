<script lang="ts">
    import Editor from '$lib/components/editor/editor.svelte';
    import { filesystem } from '$lib/components/editor/filesystem';
    import Filesystem from '$lib/components/editor/filesystem.svelte';
    import { synapse } from '$lib/components/studio/synapse.svelte';

    let instance: Editor;

    function getLanguageFromExtensions(path: string) {
        if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript';
        if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
        if (path.endsWith('.html')) return 'html';
        if (path.endsWith('.css')) return 'css';
        return 'file';
    }

    async function openFile(path: string) {
        const message = await synapse.dispatch('fs', {
            operation: 'getFile',
            params: {
                filepath: path
            }
        });
        instance?.loadCode(message.data as string, getLanguageFromExtensions(path));
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
</script>

<main>
    <Filesystem files={$filesystem} onopenfile={openFile} onopenfolder={openFolder} />
    <Editor bind:this={instance} />
</main>

<style lang="scss">
    main {
        height: 100%;
        display: grid;
        grid-template-columns: 25% 75%;
    }
</style>
