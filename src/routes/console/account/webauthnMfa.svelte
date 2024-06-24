<script lang="ts">
    import { Submit, trackEvent } from '$lib/actions/analytics';
    import { Button } from '$lib/elements/forms';
    import Modal from '$lib/components/modal.svelte';
    import { sdk } from '$lib/stores/sdk';

    export let showWebauthnSetup = false;

    let step = 1;
    let error = '';

    async function addAuthenticator() {
        try {
            await sdk.forConsole.webauthnAccount.createMfaWebauthnAuthenticatorHelper();
        } catch (e) {
            error = e.message;
        }
        trackEvent(Submit.AccountAuthenticatorCreate);

        step = 2;
    }
</script>

<Modal
    title="Add security key"
    bind:show={showWebauthnSetup}
    {error}>
    {#if step === 1}
        <p>
            Follow the instructions provided by your browser to register a new security key.
        </p>
        {#await addAuthenticator()}
        <div class="loading">
            <div class="loader"></div>
        </div>
        {/await}
    {:else if step === 2}
        <p>
            Security key added successfully.
        </p>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showWebauthnSetup = false)}>Cancel</Button>
        {#if step === 2}
            <Button submit>Finish</Button>
        {/if}
    </svelte:fragment>
</Modal>