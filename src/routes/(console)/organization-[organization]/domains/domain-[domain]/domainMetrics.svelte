<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import { UsageCard } from '$lib/components';
    import type { Models } from '@appwrite.io/console';
    import { toLocaleDate } from '$lib/helpers/date';

    export let domain: Models.ProxyRule;
    let metrics = [
        {
            value: domain.domain,
            description: 'Domain'
        },
        {
            value: domain?.registrar || 'N/A',
            description: 'Registrar'
        },
        {
            value: domain?.nameservers || 'N/A',
            description: 'Nameservers'
        },
        {
            value: domain?.expiresAt ? toLocaleDate(domain?.expiresAt) : 'N/A',
            description: 'Exipiry date'
        },
        {
            value: domain?.autoRenewals ? 'On' : 'off',
            description: 'Auto renewal'
        },
        {
            value: domain?.renewalPrice || 'N/A',
            description: 'Renewal price'
        }
    ];
</script>

<Layout.Stack direction="row">
    {#each metrics as metric}
        <UsageCard description={metric.description} bind:value={metric.value} />
    {/each}
</Layout.Stack>
