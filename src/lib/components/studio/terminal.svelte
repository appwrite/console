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
            let buffer = '';
            term.onKey(({ domEvent }) => {
                if (domEvent.key === 'Enter') {
                    if (socket.readyState === WebSocket.OPEN) {
                        const terminalOperation = {
                            type: 'terminal',
                            operation: 'createCommand',
                            params: {
                                command: buffer + '\n'
                            },
                            requestId: Date.now().toString()
                        };

                        socket.send(JSON.stringify(terminalOperation));
                        buffer = '';
                        term.write('\r\n');
                    }
                }

                if (domEvent.key === 'Backspace') {
                    if (domEvent.metaKey) {
                        buffer = '';
                        term.write('\x1b[2K\r');
                    } else {
                        buffer = buffer.slice(0, -1);
                        term.write('\b \b');
                    }
                    return;
                }

                if (domEvent.metaKey) {
                    return;
                }

                if (
                    domEvent.key.length === 1 &&
                    !domEvent.ctrlKey &&
                    !domEvent.altKey &&
                    !domEvent.metaKey
                ) {
                    buffer += domEvent.key;
                    term.write(domEvent.key);
                    return;
                }

                if (domEvent.key === 'ArrowUp') {
                    return;
                }
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
