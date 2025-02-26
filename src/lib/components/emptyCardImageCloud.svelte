<script>
    import { getNextTier, tierToPlan } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { Card, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let source = 'empty_state_card';
    export let noAspectRatio = false;
</script>

<Card.Base variant="secondary" padding="s">
    <Layout.Stack direction="row">
        {#if $$slots?.image}
            <div
                style:--p-file-preview-border-color="transparent"
                class="file-preview is-full-cover-image u-width-full-line u-height-100-percent"
                style={noAspectRatio ? 'aspect-ratio: auto' : ''}>
                <slot name="image" />
            </div>
        {/if}
        <Layout.Stack justifyContent="center">
            <Layout.Stack gap="xxs">
                <Typography.Text variant="m-600"><slot name="title" /></Typography.Text>
                <Typography.Text>
                    <slot nextTier={tierToPlan(getNextTier($organization.billingPlan)).name} />
                </Typography.Text>
            </Layout.Stack>
            <slot name="cta" {source} />
        </Layout.Stack>
    </Layout.Stack>
</Card.Base>
