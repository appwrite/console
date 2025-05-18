<script lang="ts">
    import Modal from '$lib/components/modal.svelte';
    import Button from '$lib/elements/forms/button.svelte';

    export let show: boolean;
    export let error: string;
    export let title: string;
    export let header: string;
</script>

<Modal {title} bind:show>
    <div class="box u-flex-vertical u-gap-24">
        <p class="u-inline-flex u-cross-center u-gap-8">
            <span
                class="icon-exclamation-circle u-font-size-20"
                aria-hidden="true"
                style="color:hsl(var(--color-danger-100));"></span
            >{header}
        </p>
        <p>{error}</p>
    </div>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
