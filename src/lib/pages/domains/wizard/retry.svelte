<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { domain } from './store';
    import CnameTable from './cnameTable.svelte';
    import { createEventDispatcher } from 'svelte';

    let retrying = false;

    const dispatch = createEventDispatcher();

    async function retry() {
        try {
            retrying = true;
            $domain = await sdk.forProject.proxy.updateRuleVerification($domain.$id);
        } catch (error) {
            dispatch('error', error.message);
        } finally {
            retrying = false;
        }
    }
</script>

<div class="u-flex u-gap-8 u-cross-center">
    <span
        class="icon-exclamation-circle"
        aria-hidden="true"
        style="color: hsl(var(--color-danger-100))" />
    <p class="u-stretch">Verification failed</p>
    <Button secondary on:click={retry} disabled={retrying}>
        {#if retrying}
            <div class="loader" style="color: hsl(var(--color-neutral-50))" />
        {:else}
            Retry
        {/if}
    </Button>
</div>
<div class="u-margin-block-start-24">
    <p>
        In order to continue, set the following record on your DNS provider. Find a list of domain
        providers and their DNS settings in our documentation. Changes may take time to be
        effective.
    </p>
</div>
<div class="u-margin-block-start-24">
    <CnameTable />
</div>
