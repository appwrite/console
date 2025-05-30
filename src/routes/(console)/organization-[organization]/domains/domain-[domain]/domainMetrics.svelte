<script lang="ts">
    import { UsageCard } from '$lib/components';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Layout, Status } from '@appwrite.io/pink-svelte';
    import { Link } from '$lib/elements';
    import type { Models } from '@appwrite.io/console';

    let { domain, retryVerification }: { domain: Models.Domain; retryVerification: () => void } =
        $props();

    const isDomainVerified = domain.nameservers.toLocaleLowerCase() === 'appwrite';

    const metrics = [
        {
            value: isDomainVerified ? 'Verified' : 'Not verified',
            description: 'Status'
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
            value: domain?.expire ? toLocaleDate(domain.expire) : '-',
            description: 'Expiry date'
        },
        {
            value:
                domain?.registrar?.toLocaleLowerCase() === 'appwrite'
                    ? domain?.autoRenewal
                        ? 'On'
                        : 'Off'
                    : '-',
            description: 'Auto renewal'
        },
        {
            value: domain?.renewalPrice || '-',
            description: 'Renewal price'
        }
    ];
</script>

<Layout.Grid gap="m" columnsL={6} columns={3} columnsS={2} columnsXXS={1}>
    {#each metrics.slice(0, 3) as metric}
        {#if metric.description === 'Status'}
            <UsageCard description={metric.description}>
                <Layout.Stack direction="row" gap="xs" alignItems="center">
                    <Status
                        --font-size-s="var(--font-size-xs)"
                        label={metric.value.toString()}
                        status={isDomainVerified ? 'complete' : 'pending'} />

                    {#if !isDomainVerified}
                        <Link size="s" on:click={retryVerification}>Retry</Link>
                    {/if}
                </Layout.Stack>
            </UsageCard>
        {:else}
            <UsageCard description={metric.description} bind:value={metric.value} />
        {/if}
    {/each}
    {#each metrics.slice(3) as metric}
        <UsageCard description={metric.description} bind:value={metric.value} />
    {/each}
</Layout.Grid>
