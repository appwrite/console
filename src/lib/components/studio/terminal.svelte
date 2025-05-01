<script lang="ts">
    import '@xterm/xterm/css/xterm.css';
    import type { Action } from 'svelte/action';
    import type { Terminal } from '@xterm/xterm';

    type Props = {
        height: number;
        onmessage: (message: MessageEvent, terminal: Terminal) => void | Promise<void>;
    };
    let { height, onmessage }: Props = $props();

    function connect(term: Terminal) {
        const socket = new WebSocket(`wss://terminal.appwrite.torsten.work/dummy`);

        socket.onopen = () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.send(
                    JSON.stringify({
                        type: 'terminal',
                        operation: 'updateSize',
                        params: {
                            cols: term.cols,
                            rows: term.rows
                        },
                        requestId: Date.now().toString()
                    })
                );
            }
        };

        socket.onmessage = (msg) => {
            onmessage(msg, term);
        };

        socket.onerror = (err) => {
            console.error('WebSocket error:', err);
        };

        return socket;
    }

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
            term.loadAddon(new FitAddon());
            term.open(node);

            const socket = connect(term);
            term.onKey(({ domEvent, key }) => {
                const terminalOperation = {
                    type: 'terminal',
                    operation: 'createCommand',
                    params: {
                        command: key
                    },
                    requestId: Date.now().toString()
                };

                socket.send(JSON.stringify(terminalOperation));
            });
        };
        init();
    };
</script>

<div class="terminal-container" style:height={`${height}px`}>
    <div use:terminal></div>
</div>

<style>
    .terminal-container {
        padding: var(--space-3);
        border-radius: var(--border-radius-xsmall);
        background-color: black;
        overflow-y: scroll;
    }
</style>
