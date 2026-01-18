<script lang="ts">
    import { isSmallViewport } from '$lib/stores/viewport';
    import { organization } from '$lib/stores/organization';
    import { Card, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { getNextTierBillingPlan, billingIdToPlan } from '$lib/stores/billing';

    export let source = 'empty_state_card';
    export let responsive = false;

    // type def for Layout.Stack!
    let direction: 'column' | 'row' | 'row-reverse' | 'column-reverse' = 'row';

    $: direction = responsive ? ($isSmallViewport ? 'column' : 'row') : 'row';

    $: nextTierBillingPlan = getNextTierBillingPlan($organization.billingPlan);
</script>

<Card.Base variant="secondary" padding="s" radius="s">
    <Layout.Stack {direction} gap="l">
        {#if $$slots?.image}
            <div style="flex-shrink:0">
                <slot name="image" />
            </div>
        {/if}
        <Layout.Stack justifyContent="center">
            <Layout.Stack gap="xxs">
                <Typography.Text variant="m-600"><slot name="title" /></Typography.Text>
                <Typography.Text>
                    <slot nextTier={billingIdToPlan(nextTierBillingPlan)?.name} />
                </Typography.Text>
            </Layout.Stack>
            <slot name="cta" {source} />
        </Layout.Stack>
    </Layout.Stack>
</Card.Base>
