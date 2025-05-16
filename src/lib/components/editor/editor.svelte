<script lang="ts">
    import { onDestroy, onMount, untrack } from 'svelte';
    import { throttle } from '$lib/helpers/functions';
    import { app } from '$lib/stores/app';
    import { studio } from '../studio/studio.svelte';
    import * as monaco from 'monaco-editor';

    type Props = {
        onsave?: (code: string) => void | Promise<void>;
    };

    let { onsave }: Props = $props();

    let editorElement: HTMLDivElement;

    export function openFile(code: string, path: string) {
        if (!code || path.endsWith('/')) return;
        const uri = monaco.Uri.parse(path);
        const model = monaco.editor.getModel(uri) ?? monaco.editor.createModel(code, null, uri);
        model.setValue(code);
        studio.editor.setModel(model);
    }

    export function resize(height: number, width: number) {
        studio.editor?.layout(
            {
                height,
                width
            },
            true
        );
    }

    onMount(async () => {
        await studio.initEditor(editorElement);
        studio.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            onsave(studio.editor.getValue());
        });
        const resizer = throttle(() => {
            if (!editorElement) return;
            studio.editor.layout({
                height: editorElement.parentElement.offsetHeight,
                width: editorElement.parentElement.offsetWidth
            });
        }, 50);
        const observer = new ResizeObserver(resizer);

        observer.observe(editorElement);
    });

    onDestroy(() => {
        monaco?.editor.getModels().forEach((model) => model.dispose());
        studio.editor?.dispose();
    });

    $effect(() => {
        monaco.editor.setTheme($app.themeInUse === 'light' ? 'vs-light' : 'vs-dark');
    });
    $effect(() => {
        const readOnly = studio.streaming;
        untrack(() =>
            studio.editor.updateOptions({
                readOnly
            })
        );
    });
</script>

<div class="editor" role="presentation" bind:this={editorElement}></div>

<style>
    .editor {
        height: 100%;
        overflow: hidden;
    }
</style>
