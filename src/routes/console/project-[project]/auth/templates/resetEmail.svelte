<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';

    export let show = false;

    let error: string;

    async function reset() {
        try {
            // await sdk.forConsole.projects.resetEmailTemplate()
            show = false;
        } catch (e) {
            error = e.message;
        }
    }
</script>

<Modal
    icon="exclamation"
    state="warning"
    onSubmit={reset}
    size="small"
    {error}
    bind:show
    headerDivider={false}>
    <svelte:fragment slot="header">Reset Email Template?</svelte:fragment>
    <p class="text">
        Are you sure you want to reset the email template?
        <b>Default values will be set in all inputs.</b>
    </p>

    <svelte:fragment slot="footer">
        <Button text secondary on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Reset</Button>
    </svelte:fragment>
</Modal>
