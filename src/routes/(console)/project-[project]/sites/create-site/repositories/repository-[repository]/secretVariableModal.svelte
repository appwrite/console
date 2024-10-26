<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Layout } from '@appwrite.io/pink-svelte';

    export let show = false;
</script>

<Modal title="Secret variable" size="big" bind:show>
    <Layout.Stack gap="l">
        <p>
            Secret variables are hidden from both the UI and API. Once a variable is marked as
            secret, this action cannot be reversed.
        </p>
        <p>Are you sure you want to make this variable secret?</p>
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button
            on:click
            on:click={() => {
                show = false;
            }}>
            Mark as secret
        </Button>
    </svelte:fragment>
</Modal>
