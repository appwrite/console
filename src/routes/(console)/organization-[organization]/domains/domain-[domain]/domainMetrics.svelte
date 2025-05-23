<script lang="ts">
    import { UsageCard } from '$lib/components';
    import type { Domain } from '$lib/sdk/domains';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Layout, Status } from '@appwrite.io/pink-svelte';

    export let domain: Domain;

    $: isDomainVerified = domain.nameservers.toLocaleLowerCase() === 'appwrite';

    let metrics = [
        {
            value: isDomainVerified ? 'Verified' : 'Not verified',
            description: 'Status'
        },
        {
            value: domain?.registrar || '-',
            description: 'Registrar'
        },
        {
            value: domain?.nameservers ? domain?.nameservers : '-',
            description: 'Nameservers'
        },
        {
            value: domain?.expiry ? toLocaleDate(domain?.expiry) : '-',
            description: 'Expiry date'
        },
        {
            value: domain?.autoRenewal ? 'On' : 'Off',
            description: 'Auto renewal'
        },
        {
            value: domain?.renewalPrice || '-',
            description: 'Renewal price'
        }
    ];
</script>

<Layout.Grid gap="m" columnsL={2} columns={1}>
    <Layout.Stack direction="row" gap="m">
        {#each metrics.slice(0, 3) as metric}
            {#if metric.description === 'Status'}
                <UsageCard description={metric.description}>
                    <Status
                        label={metric.value.toString()}
                        status={isDomainVerified ? 'complete' : 'pending'} />
                </UsageCard>
            {:else}
                <UsageCard description={metric.description} bind:value={metric.value} />
            {/if}
        {/each}
    </Layout.Stack>
    <Layout.Stack direction="row" gap="m">
        {#each metrics.slice(3) as metric}
            <UsageCard description={metric.description} bind:value={metric.value} />
        {/each}
    </Layout.Stack>
</Layout.Grid>
