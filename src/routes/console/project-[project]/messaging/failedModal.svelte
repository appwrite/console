<script lang="ts">
    import Code from '$lib/components/code.svelte';
    import Modal from '$lib/components/modal.svelte';
    import Button from '$lib/elements/forms/button.svelte';

    export let show: boolean;
    export let errors: string[];
</script>

<Modal title="Message error" headerDivider={false} bind:show size="big">
    <div class="box u-flex-vertical u-gap-24">
        <p>Some messages failed to send.</p>
        <div style="max-inline-size: 524px">
            <Code language="html" code={errors.join('\n')} noMargin noBoxPadding allowScroll />
        </div>
    </div>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
