<script lang="ts">
    import { Modal } from '$lib/components';
    import Code from '$lib/components/code.svelte';
    import { Button } from '$lib/elements/forms';

    export let showLogs = false;
    export let logs: string;
</script>

<Modal bind:show={showLogs}>
    <svelte:fragment slot="header">Certificate Logs</svelte:fragment>
    <p>Logs from the process of certificate generation with LetsEncrypt and Certbot.</p>

    <Code withLineNumbers withCopy language="sh" code={logs} />

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showLogs = false)}>Close</Button>
    </svelte:fragment>
</Modal>
