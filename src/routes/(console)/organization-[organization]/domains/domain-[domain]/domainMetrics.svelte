<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import { UsageCard } from '$lib/components';
    import type { Models } from '@appwrite.io/console';
    import { toLocaleDate } from '$lib/helpers/date';

    export let domain: Models.Domain;
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
            value: domain?.nameservers || '-',
            description: 'Nameservers'
        },
        {
            value: domain?.expiry ? toLocaleDate(domain?.expiry) : '-',
            description: 'Exipiry date'
        },
        {
            value: domain?.autoRenewal ? 'On' : 'off',
            description: 'Auto renewal'
        },
        {
            value: domain?.renewalPrice || '-',
            description: 'Renewal price'
        }
    ];
</script>

<Layout.Stack direction="row">
    {#each metrics as metric}
        <UsageCard description={metric.description} bind:value={metric.value} />
    {/each}
</Layout.Stack>
