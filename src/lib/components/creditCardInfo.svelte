<script lang="ts">
    import type { PaymentMethodData } from '$lib/sdk/billing';
    import { Badge, Layout, Link, Popover, Table } from '@appwrite.io/pink-svelte';
    import CreditCardBrandImage from './creditCardBrandImage.svelte';
    import type { TableRootProp } from '$lib/helpers/types';

    export let root: TableRootProp;
    export let paymentMethod: PaymentMethodData;
    export let isBackup: boolean = false;
</script>

<Table.Cell column="cc" {root}>
    <Layout.Stack direction="row" alignItems="center" gap="s">
        <CreditCardBrandImage brand={paymentMethod?.brand} />
        <span>ending in {paymentMethod?.last4}</span>
        {#if isBackup}
            <Badge variant="secondary" content="Backup" />
        {/if}
    </Layout.Stack>
</Table.Cell>
<Table.Cell column="name" {root}>{paymentMethod?.name}</Table.Cell>
<Table.Cell column="expiry" {root}>
    {paymentMethod?.expiryMonth}/{paymentMethod?.expiryYear}
</Table.Cell>
<Table.Cell column="status" {root}>
    {#if paymentMethod?.lastError || paymentMethod?.expired}
        <Popover let:toggle>
            <Layout.Stack gap="xs" direction="row">
                <Badge variant="secondary" type="error" content="Failed" />
                <Link.Button on:click={toggle}>Details</Link.Button>
            </Layout.Stack>
            <svelte:fragment slot="tooltip">
                {#if paymentMethod?.expired}
                    This payment method has expired
                {/if}
                {#if paymentMethod?.lastError}
                    {paymentMethod.lastError}
                {/if}
            </svelte:fragment>
        </Popover>
    {/if}
</Table.Cell>
