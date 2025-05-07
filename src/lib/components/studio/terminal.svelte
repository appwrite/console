<script lang="ts">
    import '@xterm/xterm/css/xterm.css';
    import type { Action } from 'svelte/action';
    import type { Synapse } from './synapse.svelte';

    type Props = {
        height: number;
        synapse: Synapse;
    };
    let { height, synapse }: Props = $props();

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
            term.onKey(({ key }) => {
                synapse.dispatch('terminal', {
                    operation: 'createCommand',
                    params: {
                        command: key
                    }
                });
            });
            synapse.addEventListener('terminalResponse', ({ message }) => {
                const { data } = message;
                term.write(data);
            });
            const observer = new ResizeObserver(() => {
                const { cols, rows } = fitAddon.proposeDimensions();
                if (term.cols === cols && term.rows === rows) return;
                term.resize(cols, rows);
                synapse.dispatch('terminal', {
                    operation: 'updateSize',
                    params: {
                        rows,
                        cols
                    }
                });
            });
            observer.observe(node);
        };
        init();
    };
</script>

<div class="terminal-container" style:height={`${height}px`} use:terminal></div>

<style>
    .terminal-container {
        padding: var(--space-3);
        border-radius: var(--border-radius-xsmall);
        background-color: black;
        overflow: none;
    }
</style>
