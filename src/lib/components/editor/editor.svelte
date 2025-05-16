<script lang="ts">
    import { onDestroy, onMount } from 'svelte';
    import * as monaco from 'monaco-editor';
    import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
    import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';
    import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker';
    import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker';
    import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
    import markdownWorker from 'monaco-editor/esm/vs/basic-languages/markdown/markdown?worker';
    import { throttle } from '$lib/helpers/functions';
    import { app } from '$lib/stores/app';

    type Props = {
        onsave?: (code: string) => void | Promise<void>;
    };

    let { onsave }: Props = $props();

    let editorElement: HTMLDivElement;
    let editor: monaco.editor.IStandaloneCodeEditor;

    export function openFile(code: string, path: string) {
        const uri = monaco.Uri.parse(path);
        const model = monaco.editor.getModel(uri) ?? monaco.editor.createModel(code, null, uri);
        model.setValue(code);
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

    function save(event: KeyboardEvent) {
        if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            onsave(editor.getValue());
        }
    }

    onMount(async () => {
        self.MonacoEnvironment = {
            getWorker(_workerId: string, label: string) {
                if (label === 'markdown') {
                    return new markdownWorker();
                }
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

        const resizer = throttle(() => {
            if (!editorElement) return;
            editor.layout({
                height: editorElement.parentElement.offsetHeight,
                width: editorElement.parentElement.offsetWidth
            });
        }, 50);
        const observer = new ResizeObserver(resizer);

        observer.observe(editorElement);
    });

    onDestroy(() => {
        monaco?.editor.getModels().forEach((model) => model.dispose());
        editor?.dispose();
    });

    $effect(() => {
        monaco.editor.setTheme($app.themeInUse === 'light' ? 'vs-light' : 'vs-dark');
    });
</script>

<div class="editor" role="presentation" bind:this={editorElement} onkeydown={save}></div>

<style>
    .editor {
        height: 100%;
        overflow: hidden;
    }
</style>
