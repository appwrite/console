<script lang="ts">
    import { UsageCard } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import type { Domain } from '$lib/sdk/domains';
    import { toLocaleDate } from '$lib/helpers/date';
    import { IconRefresh } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Status, Tooltip } from '@appwrite.io/pink-svelte';

    let { domain, retryVerification }: { domain: Domain; retryVerification: () => void } = $props();

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
            value: domain?.expiry ? toLocaleDate(domain.expiry) : '-',
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
                    <Layout.Stack direction="row" gap="xxs" alignItems="center">
                        <Status
                            label={metric.value.toString()}
                            status={isDomainVerified ? 'complete' : 'pending'} />

                        {#if !isDomainVerified}
                            <Tooltip>
                                <Button text icon on:click={retryVerification}>
                                    <Icon
                                        size="s"
                                        icon={IconRefresh}
                                        color="--fgcolor-neutral-secondary" />
                                </Button>
                                <span slot="tooltip">Verify domain</span>
                            </Tooltip>
                        {/if}
                    </Layout.Stack>
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
