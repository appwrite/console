<script>
    // const xtermPkg = require('@xterm/xterm');
    // const { Terminal } = xtermPkg;
    // import { onMount } from 'svelte';
    // import '@xterm/xterm/css/xterm.css';
    //
    // let terminalContainer;
    export let height;
    //
    // onMount(() => {
    //     const term = new Terminal();
    //     term.open(terminalContainer);
    //     term.write('Hello from xterm.js!\r\n');
    // });
</script>

<div class="terminal-container" style:height={`${height}px`}>
    <!--    <div bind:this={terminalContainer}></div>-->
</div>

<style>
    .terminal-container {
        padding: var(--space-3);
        border-radius: var(--border-radius-xsmall);
        background-color: black;
        overflow-y: scroll;
    }
</style>
