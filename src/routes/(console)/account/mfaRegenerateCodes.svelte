<script lang="ts">
    import { Modal } from '$lib/components';
    import MfaChallengeFormList, { verify } from '$lib/components/mfaChallengeFormList.svelte';
    import { Button } from '$lib/elements/forms';
    import { type Models } from '@appwrite.io/console';

    export let show = false;
    export let regenerateRecoveryCodes: () => Promise<void>;
    export let factors: Models.MfaFactors & { recoveryCode: boolean };

    let error = '';
    let challenge: Models.MfaChallenge = null;
    let code = '';

    async function submit() {
        try {
            await verify(challenge, code);
            await regenerateRecoveryCodes();
            show = false;
        } catch (e) {
            error = e.message;
        }
    }

    $: if (show) {
        error = '';
        challenge = null;
        code = '';
    }
</script>

<Modal title="Regenerate recovery codes" {error} onSubmit={submit} bind:show>
    <p>
        Are you sure you want to regenerate all recovery codes? All <b
            >previously generated recovery codes will become invalid.</b>
    </p>
    <MfaChallengeFormList
        factors={{ ...factors, recoveryCode: false }}
        bind:challenge
        bind:code
        showVerifyButton={false} />

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button secondary submit>Regenerate</Button>
    </svelte:fragment>
</Modal>
