<script lang="ts">
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { currentPlan, organizationList } from '$lib/stores/organization';
    import SupportWizard from '$routes/(console)/supportWizard.svelte';
    import { wizard } from '$lib/stores/wizard';
    import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';

    function contactSupport() {
        wizard.start(SupportWizard);
    }

    $: allOrgsHavePremiumSupport = $organizationList.teams.every(
        (team) => (team as Models.Organization).billingPlanDetails.premiumSupport
    );

    $: hasPremiumSupport = $currentPlan?.premiumSupport ?? allOrgsHavePremiumSupport ?? false;
</script>

{#if page.error.type === 'general_resource_blocked'}
    <section class="resource-blocked">
        <div class="resource-blocked__content">
            <Layout.Stack gap="s" alignItems="center">
                <Badge type="error" variant="secondary" content="Access blocked" />
                <Typography.Title size="l" align="center">
                    This resource page can&apos;t be accessed. Check your permissions or contact
                    support for help.
                </Typography.Title>
                <div class="u-margin-block-start-16">
                    {#if hasPremiumSupport}
                        <Button secondary on:click={contactSupport}>Contact support</Button>
                    {:else}
                        <Button secondary href="mailto:support@appwrite.io">Contact support</Button>
                    {/if}
                </div>
            </Layout.Stack>
        </div>
    </section>
{:else}
    <section class="resource-blocked resource-blocked--default">
        <div class="resource-blocked__content">
            <Layout.Stack gap="s" alignItems="center">
                <Typography.Title size="s" align="center">
                    {'status' in page.error
                        ? page.error.status || 'Invalid Argument'
                        : 'Invalid Argument'}
                </Typography.Title>
                <p class="u-text-center">{page.error.message}</p>
            </Layout.Stack>
        </div>
    </section>
{/if}

<style>
    .resource-blocked {
        min-height: calc(100vh - 48px - 2rem);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4rem 1.5rem;
        text-align: center;
    }

    .resource-blocked__content {
        width: min(100%, 33rem);
        max-width: 33rem;
    }

    .resource-blocked p {
        margin: 0;
        color: var(--fgcolor-neutral-secondary, #56565c);
        font-size: 1rem;
        line-height: 1.5;
        text-wrap: balance;
    }
</style>
