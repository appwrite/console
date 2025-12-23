<script lang="ts">
    import { isSmallViewport } from '$lib/stores/viewport';
    import { organization } from '$lib/stores/organization';
    import { getNextTier, tierToPlan } from '$lib/stores/billing';
    import { Card, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let source = 'empty_state_card';
    export let responsive = false;

    // type def for Layout.Stack!
    let direction: 'column' | 'row' | 'row-reverse' | 'column-reverse' = 'row';

    $: direction = responsive ? ($isSmallViewport ? 'column' : 'row') : 'row';
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
                    <slot nextTier={tierToPlan(getNextTier($organization.billingPlanId)).name} />
                </Typography.Text>
            </Layout.Stack>
            <slot name="cta" {source} />
        </Layout.Stack>
    </Layout.Stack>
</Card.Base>
