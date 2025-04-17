<script>
    import Base from './base.svelte';
    import { upgradeURL } from '$lib/stores/billing';
    import { isCloud } from '$lib/system';
    import { organization } from '$lib/stores/organization';
    import { BillingPlan } from '$lib/constants';
    import Button from '$lib/elements/forms/button.svelte';
    import { Badge, Layout, Link, Typography } from '@appwrite.io/pink-svelte';
</script>

<Base>
    <Layout.Stack gap="s">
        {#if isCloud}
            {#if $organization?.billingPlan !== BillingPlan.FREE}
                <Typography.Text variant="m-600">Roles</Typography.Text>
                <Typography.Text>Owner, Developer, Editor, Analyst, Designer and Billing.</Typography.Text>
                <Typography.Text>
                    <Link.Anchor
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://appwrite.io/docs/advanced/platform/roles"
                        >Learn more</Link.Anchor>
                </Typography.Text>
            {:else}
                <Layout.Stack direction="row" gap="s">
                    <Typography.Text variant="m-600">
                        <span class="u-bold">Roles</span>
                    </Typography.Text>
                    <Badge variant="secondary" size="xs" content="Pro plan" />
                </Layout.Stack>
                <Typography.Text>
                    Upgrade to Pro to assign new roles to members such as Owner, Developer, Editor, Designer
                    or Analyst.
                </Typography.Text>

                <p class="u-flex u-main-end u-cross-center u-gap-4">
                    <Button
                        size="s"
                        text
                        external
                        href="https://appwrite.io/docs/advanced/platform/roles">Learn more</Button>
                    <Button size="s" secondary external href={$upgradeURL}>Upgrade plan</Button>
                </p>
            {/if}
        {:else}
            <Layout.Stack direction="row" gap="s">
                <Typography.Text variant="m-600">
                    <span class="u-bold">Roles</span>
                </Typography.Text>
                <Badge variant="secondary" size="xs" content="Cloud" />
            </Layout.Stack>
            <Typography.Text>
                Upgrade to Cloud to assign new roles to members or ask us about our enterprise self
                hosted offering.
            </Typography.Text>
            <p class="u-flex u-main-end u-cross-center u-gap-4">
                <Button
                    size="s"
                    text
                    external
                    href="https://appwrite.io/docs/advanced/platform/roles">Learn more</Button>
                <Button size="s" secondary external href={$upgradeURL}>Upgrade to Cloud</Button>
            </p>
        {/if}
    </Layout.Stack>
</Base>
