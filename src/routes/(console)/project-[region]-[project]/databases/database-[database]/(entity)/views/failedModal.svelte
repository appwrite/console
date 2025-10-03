<script lang="ts">
    import { Modal } from '$lib/components';
    import { Alert } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';

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

<Modal {title} bind:show size="s">
    <Alert.Inline title={header} status="error">{error}</Alert.Inline>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
