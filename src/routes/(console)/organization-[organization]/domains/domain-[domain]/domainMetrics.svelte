<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import { Trim, UsageCard } from '$lib/components';
    import { toLocaleDate } from '$lib/helpers/date';
    import type { Domain } from '$lib/sdk/domains';
    import { Link } from '$lib/elements';
    import { protocol } from '$routes/(console)/store';

    export let domain: Domain;
    let metrics = [
        {
            value: domain.domain,
            description: 'Domain'
        },
        {
            value: domain?.registrar || '-',
            description: 'Registrar'
        },
        {
            value: domain?.nameservers ? domain?.nameservers.join(', ') : '-',
            description: 'Nameservers'
        },
        {
            value: domain?.expiry ? toLocaleDate(domain?.expiry) : '-',
            description: 'Exipiry date'
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
            {#if metric.description === 'Domain'}
                <UsageCard description={metric.description}>
                    <Link external href={`${$protocol}/${metric.value}`} variant="quiet">
                        <Trim alternativeTrim>
                            {metric.value}
                        </Trim>
                    </Link>
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
