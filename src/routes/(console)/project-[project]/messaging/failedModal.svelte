<script lang="ts">
    import Code from '$lib/components/code.svelte';
    import Modal from '$lib/components/modal.svelte';
    import Button from '$lib/elements/forms/button.svelte';

    export let show: boolean;
    export let errors: string[];
</script>

<Modal title="Message error" bind:show>
    <div class="box u-flex-vertical u-gap-24">
        <p class="u-inline-flex u-cross-center u-gap-8">
            <span
                class="icon-exclamation-circle u-font-size-20"
                aria-hidden="true"
                style="color:hsl(var(--color-danger-100));"></span
            >Message failed
        </p>
        <p>
            The message has been processed with errors. Please refer to the logs below for more
            information.
        </p>
        <div style="max-inline-size: 524px" class="wrapped-code-block-for-multi-line">
            <Code language="html" code={errors.join('\n')} withCopy allowScroll />
        </div>
    </div>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>

<style>
    /* Certain errors are in a single line; this makes them multi-line for better readability. */
    .wrapped-code-block-for-multi-line :global(pre),
    .wrapped-code-block-for-multi-line :global(code) {
        padding: unset;
        white-space: pre-wrap;
    }
</style>
