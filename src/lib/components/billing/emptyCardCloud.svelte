<script lang="ts">
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { BillingPlan } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { tierToPlan, upgradeURL } from '$lib/stores/billing';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { Card } from '..';

    export let service: string;
    export let eventSource: string;
</script>

<Card>
    <slot>
        <Layout.Stack alignItems="center">
            <Typography.Text variant="m-600">Upgrade to add {service}</Typography.Text>
            <Typography.Text>
                Upgrade to a {tierToPlan(BillingPlan.PRO).name} plan to add {service} to your organization
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
    </slot>
</Card>
