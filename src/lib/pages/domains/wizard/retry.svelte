<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { domain } from './store';
    import CnameTable from './cnameTable.svelte';
    import { createEventDispatcher } from 'svelte';
    import { Box, Code, Trim } from '$lib/components';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';

    let retrying = false;

    const dispatch = createEventDispatcher();

    async function retry() {
        try {
            retrying = true;
            $domain = await sdk.forProject.proxy.updateRuleVerification($domain.$id);
            invalidate(Dependencies.FUNCTION_DOMAINS);
            addNotification({
                message:
                    $domain.status === 'unverfied'
                        ? 'Domain certificate has been generated successfully'
                        : 'Domain has been verified successfully',
                type: 'success'
            });
            trackEvent(Submit.DomainUpdateVerification);
        } catch (error) {
            dispatch('error', error.message);
            trackError(error, Submit.DomainUpdateVerification);
        } finally {
            retrying = false;
        }
    }
</script>

{#if $domain.status === 'created'}
    <Box radius="small">
        <div class="u-flex u-gap-8 u-cross-center">
            <span class="icon-exclamation-circle u-color-text-danger" aria-hidden="true" />
            <p class="u-stretch">Verification failed</p>
            <Button secondary on:click={retry} disabled={retrying}>
                {#if retrying}
                    <div class="loader u-text-color-gray" />
                {:else}
                    Retry
                {/if}
            </Button>
        </div>
        <p class="text u-margin-block-start-24">
            In order to continue, set the following record on your DNS provider. Find a list of
            domain providers and their DNS settings in our documentation. Changes may take time to
            be effective.
        </p>
        <div class="u-margin-block-start-24">
            <CnameTable />
        </div>
    </Box>
{:else if $domain.status === 'unverified'}
    <Trim alternativeTrim><b>{$domain.domain}</b></Trim>
    <Box radius="small">
        <div class="u-flex u-gap-8 u-cross-center">
            <span class="icon-exclamation-circle u-color-text-danger" aria-hidden="true" />
            <p class="u-stretch">Generation failed</p>
            <Button secondary on:click={retry} disabled={retrying}>
                {#if retrying}
                    <div class="loader u-text-color-gray" />
                {:else}
                    Retry
                {/if}
            </Button>
        </div>
        {#if $domain?.logs}
            <Code language="sh" withCopy code={$domain.logs} />
        {/if}
    </Box>
{/if}
