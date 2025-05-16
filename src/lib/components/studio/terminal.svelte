<script lang="ts">
    import '@xterm/xterm/css/xterm.css';
    import type { Action } from 'svelte/action';
    import type { Synapse } from './synapse.svelte';
    import { throttle } from '$lib/helpers/functions';

    type Props = {
        height: number;
        synapse: Synapse;
        readonly?: boolean;
    };
    let { height, synapse, readonly = false }: Props = $props();

    const terminal: Action = (node) => {
        const init = async () => {
            const [{ Terminal }, { FitAddon }] = await Promise.all([
                import('@xterm/xterm'),
                import('@xterm/addon-fit')
            ]);
            const term = new Terminal({
                cursorBlink: true,
                allowProposedApi: true,
                fontSize: 14,
                fontFamily: 'Menlo, Monaco, "Courier New", monospace',
                convertEol: true
            });
            const fitAddon = new FitAddon();
            term.loadAddon(fitAddon);
            term.open(node);
            term.onKey(({ key, domEvent }) => {
                if (readonly) {
                    domEvent.preventDefault();
                    domEvent.stopPropagation();
                    return;
                }
                synapse.dispatch(
                    'terminal',
                    {
                        operation: 'createCommand',
                        params: {
                            command: key
                        }
                    },
                    {
                        noReturn: true
                    }
                );
            });
            term.textarea.addEventListener('paste', (e) => {
                synapse.dispatch(
                    'terminal',
                    {
                        operation: 'createCommand',
                        params: {
                            command: e.clipboardData.getData('text/plain')
                        }
                    },
                    {
                        noReturn: true
                    }
                );
            });
            synapse.addEventListener('terminal', ({ message }) => {
                const { data } = message;
                if (typeof data === 'string') term.write(data);
            });
            const resizer = throttle(() => {
                const { cols, rows } = fitAddon.proposeDimensions();
                if (term.cols === cols && term.rows === rows) return;
                if (!Number.isInteger(cols) || !Number.isInteger(rows)) return;
                term.resize(cols - 1, rows - 1);
                synapse.dispatch(
                    'terminal',
                    {
                        operation: 'updateSize',
                        params: {
                            rows: rows - 0.5,
                            cols: cols - 0.5
                        }
                    },
                    {
                        noReturn: true
                    }
                );
            }, 50);

            const observer = new ResizeObserver(resizer);
            observer.observe(node);
        };
        init();
    };
</script>

<div class="terminal-container" style:height={`${height}px`} use:terminal></div>

<style>
    .terminal-container {
        display: grid;
        place-content: flex-start;
        padding: var(--space-3);
        background-color: black;
        overflow: hidden;
    }
</style>
