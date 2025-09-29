<script lang="ts">
    import Modal from '$lib/components/modal.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconExclamationCircle } from '@appwrite.io/pink-icons-svelte';

    let {
        show = $bindable(),
        error,
        title,
        header
    }: {
        show: boolean;
        error: string;
        title: string;
        header: string;
    } = $props();
</script>

<!-- TODO: @itznotabug, Stacks please -->
<Modal {title} bind:show>
    <div class="box u-flex-vertical u-gap-24">
        <p class="u-inline-flex u-cross-center u-gap-8">
            <Icon icon={IconExclamationCircle} size="m" color="--color-danger-100" />

            {header}
        </p>
        <p>{error}</p>
    </div>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
