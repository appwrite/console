<script lang="ts">
    import type { Coupon } from '$lib/sdk/billing';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { IconTag } from '@appwrite.io/pink-icons-svelte';
    import { Badge, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';

    export let label: string;
    export let value: number;
    export let couponData: Partial<Coupon> = {
        code: null,
        status: null,
        credits: null
    };

    let adjustedValue = value;

    $: if (label?.toLowerCase() === 'credits' && couponData?.status === 'active') {
        adjustedValue = value - (couponData?.credits || 0);
    } else {
        adjustedValue = value;
    }
</script>

{#if adjustedValue > 0}
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack inline direction="row" gap="xxs" alignItems="center" alignContent="center">
            <Icon icon={IconTag} color="--fgcolor-success" size="s" />
            <Typography.Text>{label}</Typography.Text>
        </Layout.Stack>
        {#if value >= 100}
            <Badge variant="secondary" content="Credits applied" />
        {:else}
            <Typography.Text color="--fgcolor-success"
                >-{formatCurrency(adjustedValue)}</Typography.Text>
        {/if}
    </Layout.Stack>
{/if}
