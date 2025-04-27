<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import * as monaco from 'monaco-editor';
    import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
    import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
    import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
    import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
    import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
    import { throttle } from '$lib/helpers/functions';
    import { app } from '$lib/stores/app';

    let editorElement: HTMLDivElement;
    let editor: monaco.editor.IStandaloneCodeEditor;

    const code = `console.log("hello eldad");`;

    export function loadCode(code: string, language: string) {
        const model = monaco.editor.createModel(code, language);

        editor.setModel(model);
    }

    export function resize(height: number, width: number) {
        editor?.layout(
            {
                height,
                width
            },
            true
        );
    }

    onMount(async () => {
        self.MonacoEnvironment = {
            getWorker(_workerId: string, label: string) {
                if (label === 'json') {
                    return new jsonWorker();
                }
                if (label === 'css' || label === 'scss' || label === 'less') {
                    return new cssWorker();
                }
                if (label === 'html') {
                    return new htmlWorker();
                }
                if (label === 'typescript' || label === 'javascript') {
                    return new tsWorker();
                }
                return new editorWorker();
            }
        };

        monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);

        editor = monaco.editor.create(editorElement, {
            theme: $app.themeInUse === 'light' ? 'vs-light' : 'vs-dark'
        });

        loadCode(code, 'typescript');

        const resizer = throttle(() => {
            if (!editorElement) return;
            editor.layout({
                height: editorElement.offsetHeight,
                width: editorElement.offsetWidth
            });
        }, 50);
        const observer = new ResizeObserver(resizer);

        observer.observe(editorElement);
    });

    onDestroy(() => {
        monaco?.editor.getModels().forEach((model) => model.dispose());
        editor?.dispose();
    });

    $: monaco.editor.setTheme($app.themeInUse === 'light' ? 'vs-light' : 'vs-dark');
</script>

<div class="editor" bind:this={editorElement}></div>

<style>
    .editor {
        height: 100%;
        overflow: hidden;
    }
</style>
