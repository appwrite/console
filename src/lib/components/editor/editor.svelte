<script lang="ts">
    import { untrack } from 'svelte';
    import { throttle } from '$lib/helpers/functions';
    import { app } from '$lib/stores/app';
    import { studio } from '../studio/studio.svelte';
    import * as monaco from 'monaco-editor';
    import type { Action } from 'svelte/action';
    import IconImagine from '$routes/(console)/project-[project]/studio/assets/icon-imagine.svelte';

    type Props = {
        onsave?: (code: string) => void | Promise<void>;
    };

    let { onsave }: Props = $props();

    export function openFile(code: string, path: string) {
        if (path.endsWith('/')) return;
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
    const editor: Action = (node) => {
        studio.initEditor(node);
        studio.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            onsave(studio.editor.getValue());
        });
        const resizer = throttle(() => {
            if (!node) return;
            studio.editor.layout({
                height: node.parentElement.offsetHeight,
                width: node.parentElement.offsetWidth
            });
        }, 50);
        const observer = new ResizeObserver(resizer);

        observer.observe(node);

        return {
            destroy() {
                monaco?.editor.getModels().forEach((model) => model.dispose());
                studio.editor?.dispose();
            }
        };
    };

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

<div class="empty" style:display={studio.currentFile !== null ? 'none' : undefined}>
    <IconImagine />
</div>
<div
    style:display={studio.currentFile === null ? 'none' : 'contents'}
    class="editor"
    role="presentation"
    use:editor>
</div>

<style lang="scss">
    .editor {
        height: 100%;
        overflow: hidden;
    }
    .empty {
        display: grid;
        place-content: center;
        height: 100%;

        :global(svg) {
            height: 128px;
            width: 128px;
            animation: breathe 1.5s ease-in-out infinite;

            @keyframes breathe {
                0% {
                    transform: scale(1);
                }
                50% {
                    transform: scale(1.1);
                }
                100% {
                    transform: scale(1);
                }
            }
        }
    }
</style>
