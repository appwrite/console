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
    import { page } from '$app/stores';

    let retrying = false;
    export let showTitle = true;

    const dispatch = createEventDispatcher();

    async function retry() {
        try {
            retrying = true;
            $domain = await sdk
                .forProject($page.params.region, $page.params.project)
                .proxy.updateRuleVerification($domain.$id);
            invalidate(Dependencies.FUNCTION_DOMAINS);
            addNotification({
                message:
                    $domain.status === 'unverified'
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

{#if showTitle}
    <Trim alternativeTrim><b>{$domain.domain}</b></Trim>
{/if}

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
            In order to continue, set the following record on your DNS provider. DNS records may
            take up to 48 hours to propagate. Please retry over the next 48 hours, but if
            verification still fails, please <a
                href="https://appwrite.io/discord"
                target="_blank"
                rel="noopener noreferrer">contact support</a
            >.
        </p>
        <div class="u-margin-block-start-24">
            <CnameTable />
        </div>
    </Box>
{:else if $domain.status === 'unverified'}
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
        <p class="text u-margin-block-start-24">
            In order to continue, set the following record on your DNS provider. DNS records may
            take up to 48 hours to propagate. Please retry over the next 48 hours, but if
            verification still fails, please <a
                href="https://appwrite.io/discord"
                target="_blank"
                rel="noopener noreferrer">contact support</a
            >.
        </p>
        {#if $domain?.logs}
            <Code language="sh" withCopy code={$domain.logs} />
        {/if}
    </Box>
{/if}
