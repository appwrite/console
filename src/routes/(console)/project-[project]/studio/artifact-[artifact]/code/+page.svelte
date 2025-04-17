<script lang="ts">
    import Editor from '$lib/components/editor/editor.svelte';
    import { createFileSystem } from '$lib/components/editor/filesystem';
    import Filesystem from '$lib/components/editor/filesystem.svelte';
    import { Layout } from '@appwrite.io/pink-svelte';

    import html from '../../../../../../app.html?raw';
    import js from './app.js?raw';
    import css from './app.css?raw';

    const files = {
        'app.html': html,
        'src/app.js': js,
        'src/app.css': css
    };
    const filesystem = createFileSystem(Object.keys(files));

    let instance: Editor;

    function getLanguageFromExtensions(path: string) {
        if (path.endsWith('.js')) return 'javascript';
        if (path.endsWith('.ts')) return 'typescript';
        if (path.endsWith('.html')) return 'html';
        if (path.endsWith('.css')) return 'css';
        return 'folder';
    }

    function openFile(path: string) {
        instance?.loadCode(files[path], getLanguageFromExtensions(path));
    }
</script>

<Layout.Stack direction="row">
    <div style:width="30%">
        <Filesystem filesystem={$filesystem} onopenfile={openFile} />
    </div>
    <div style:width="70%">
        <Editor bind:this={instance} />
    </div>
</Layout.Stack>
