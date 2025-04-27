<script lang="ts">
    import Editor from '$lib/components/editor/editor.svelte';
    import { filesystem } from '$lib/components/editor/filesystem';
    import Filesystem from '$lib/components/editor/filesystem.svelte';

    const files = $derived(Object.keys($filesystem));

    let instance: Editor;

    function getLanguageFromExtensions(path: string) {
        if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript';
        if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
        if (path.endsWith('.html')) return 'html';
        if (path.endsWith('.css')) return 'css';
        return 'file';
    }

    function openFile(path: string) {
        instance?.loadCode($filesystem[path], getLanguageFromExtensions(path));
    }
</script>

<main>
    <Filesystem {files} onopenfile={openFile} />
    <Editor bind:this={instance} />
</main>

<style lang="scss">
    main {
        height: 100%;
        display: grid;
        grid-template-columns: 25% 75%;
    }
</style>
