<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import CnameTable from './cnameTable.svelte';
    import { createEventDispatcher } from 'svelte';
    import { Code } from '$lib/components';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import type { Models } from '@appwrite.io/console';
    import { Card, Icon, Layout, Link, Typography } from '@appwrite.io/pink-svelte';
    import { IconExclamationCircle } from '@appwrite.io/pink-icons-svelte';
    import { domain as domainStore } from './store';

    let retrying = false;
    export let showTitle = true;
    export let domain: Models.ProxyRule = $domainStore as Models.ProxyRule;

    const dispatch = createEventDispatcher();

    async function retry() {
        try {
            retrying = true;
            domain = await sdk.forProject.proxy.updateRuleVerification(domain.$id);
            invalidate(Dependencies.FUNCTION_DOMAINS);
            addNotification({
                message:
                    domain.status === 'unverified'
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

{#if domain.status === 'created'}
    <Card.Base variant="secondary" padding="s">
        <Layout.Stack gap="s" direction="row" justifyContent="space-between" wrap="wrap">
            {#if showTitle}
                <b>{domain.domain}</b>
            {/if}
            <Layout.Stack direction="row" gap="s" inline alignItems="center">
                <Icon color="--web-red-500" size="s" icon={IconExclamationCircle} />
                <Typography.Text>Verification failed</Typography.Text>
            </Layout.Stack>
        </Layout.Stack>
    </Card.Base>
    <Typography.Text>
        In order to continue, set the following record on your DNS provider. DNS records may take up
        to 48 hours to propagate. Please retry over the next 48 hours, but if verification still
        fails, please <Link.Anchor
            href="https://appwrite.io/discord"
            target="_blank"
            rel="noopener noreferrer">contact support</Link.Anchor
        >.
    </Typography.Text>
    <CnameTable />
{:else if domain.status === 'unverified'}
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
    <Typography.Text>
        In order to continue, set the following record on your DNS provider. DNS records may take up
        to 48 hours to propagate. Please retry over the next 48 hours, but if verification still
        fails, please <Link.Anchor
            href="https://appwrite.io/discord"
            target="_blank"
            rel="noopener noreferrer">contact support</Link.Anchor
        >.
    </Typography.Text>
    {#if domain?.logs}
        <Code language="sh" withCopy code={domain.logs} />
    {/if}
{/if}
