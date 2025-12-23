<script lang="ts">
    import { Card } from '..';
    import type { Snippet } from 'svelte';
    import { Button } from '$lib/elements/forms';
    import { BillingPlanGroup } from '@appwrite.io/console';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { getBasePlanFromGroup, upgradeURL } from '$lib/stores/billing';

    let {
        service,
        eventSource,
        children = null
    }: {
        service: string;
        eventSource: string;
        children?: Snippet;
    } = $props();

    const proPlanName = getBasePlanFromGroup(BillingPlanGroup.Pro).name;
</script>

<Card>
    {#if children}
        {@render children()}
    {:else}
        <Layout.Stack alignItems="center">
            <Typography.Text variant="m-600">Upgrade to add {service}</Typography.Text>
            <Typography.Text>
                Upgrade to a {proPlanName} plan to add {service} to your organization
            </Typography.Text>

            <Button
                secondary
                fullWidthMobile
                href={$upgradeURL}
                on:click={() => {
                    trackEvent(Click.OrganizationClickUpgrade, {
                        from: 'button',
                        source: eventSource
                    });
                }}>
                Upgrade
            </Button>
        </Layout.Stack>
    {/if}
</Card>
