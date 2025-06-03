<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import type { Coupon } from '$lib/sdk/billing';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { IconTag, IconX } from '@appwrite.io/pink-icons-svelte';
    import { Badge, Icon, Layout, Tooltip, Typography } from '@appwrite.io/pink-svelte';

    export let couponData: Partial<Coupon> = {
        code: null,
        status: null,
        credits: null
    };

    export let fixedCoupon = false;
</script>

{#if couponData?.credits}
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack inline direction="row" gap="s" alignItems="center" alignContent="center">
            <Layout.Stack
                inline
                direction="row"
                gap="xxs"
                alignItems="center"
                alignContent="center">
                <Icon icon={IconTag} color="--fgcolor-success" size="s" />
                {#if couponData.credits >= 100}
                    {couponData?.code?.toUpperCase()}
                {:else}
                    <Tooltip>
                        <Typography.Text color="--fgcolor-neutral-primary"
                            >Credits applied</Typography.Text>
                        <span slot="tooltip">{couponData?.code?.toUpperCase()}</span>
                    </Tooltip>
                {/if}
            </Layout.Stack>

            {#if !fixedCoupon}
                <Button
                    extraCompact
                    icon
                    on:click={() => {
                        couponData = {
                            code: null,
                            status: null,
                            credits: null
                        };
                    }}>
                    <Icon icon={IconX} size="s" />
                </Button>
            {/if}
        </Layout.Stack>

        {#if couponData.credits >= 100}
            <Badge variant="secondary" content="Credits applied" />
        {:else}
            <Typography.Text color="--fgcolor-success"
                >-{formatCurrency(couponData.credits)}</Typography.Text>
        {/if}
    </Layout.Stack>
{/if}
