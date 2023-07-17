<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Modal } from '$lib/components';

    export let show = false;
</script>

<Modal size="big" bind:show>
    <svelte:fragment slot="header">Create Deployment</svelte:fragment>
    <p class="text">
        Deploy your function from the Git provider of your choice. When you push to a connected
        repository, your function will be deployed. Learn more about <a
            href="https://appwrite.io/docs/functions-deployment"
            target="_blank"
            rel="noopener noreferrer"
            class="link">function deployments</a
        >.
    </p>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (show = false)}>Close</Button>
    </svelte:fragment>
</Modal>
