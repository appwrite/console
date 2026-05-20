<script lang="ts">
    import { goto } from '$app/navigation';
    import { base, resolve } from '$app/paths';
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { isVerifyEmailRedirectError } from '$lib/helpers/emailVerification';
    import { Container } from '$lib/layout';
    import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';

    const isPaymentError = $derived(page.status === 402);
    const billingUrl = $derived(
        page.params.organization ? `${base}/organization-${page.params.organization}/billing` : null
    );

    $effect(() => {
        const verifyEmailPath = resolve('/verify-email');
        if (isVerifyEmailRedirectError(page.error) && page.url.pathname !== verifyEmailPath) {
            goto(verifyEmailPath, { replaceState: true });
        }
    });
</script>

{#if isPaymentError}
    <section class="budget-error">
        <div class="budget-error__content">
            <Layout.Stack gap="s" alignItems="center">
                <Badge type="error" variant="secondary" content="Budget limit reached" />
                <Layout.Stack gap="xs" alignItems="center">
                    <Typography.Title size="l" align="center">
                        Your organization has reached its budget limit
                    </Typography.Title>
                    <Typography.Text align="center">
                        Access to resources has been blocked. Update your billing settings to
                        restore access.
                    </Typography.Text>
                </Layout.Stack>
                <div class="u-margin-block-start-16">
                    <Layout.Stack direction="row" gap="s" justifyContent="center">
                        {#if billingUrl}
                            <Button href={billingUrl}>Go to billing</Button>
                        {/if}
                        <Button secondary href="{base}/account/organizations"
                            >Change organization</Button>
                    </Layout.Stack>
                </div>
            </Layout.Stack>
        </div>
    </section>
{:else}
    <Container>
        <div>
            <Typography.Title size="xl"
                >{'status' in page.error
                    ? page.error.status || 'Invalid Argument'
                    : 'Invalid Argument'}</Typography.Title>
            <Typography.Title>{page.error.message}</Typography.Title>
        </div>
        <div>
            <Button href={base}>Back to the console</Button>
        </div>
    </Container>
{/if}

<style>
    .budget-error {
        min-height: calc(100vh - 48px - 2rem);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4rem 1.5rem;
        text-align: center;
    }

    .budget-error__content {
        width: min(100%, 33rem);
        max-width: 33rem;
    }
</style>
