<script lang="ts">
    import { InputSelect } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { sdk } from '$lib/stores/sdk';
    import { SiteUsageRange } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { UsageCard } from '$lib/components';

    const now = new Date();
    const rangeOptions = [
        { value: SiteUsageRange.TwentyFourHours, label: 'Last 24 hours' },
        { value: SiteUsageRange.ThirtyDays, label: 'Last 30 days' },
        { value: SiteUsageRange.NinetyDays, label: 'Last 90 days' }
    ];

    let range = SiteUsageRange.ThirtyDays;
    let metrics = [
        {
            id: 'buildsTotal',
            value: null,
            description: 'Total builds count'
        },
        {
            id: 'buildsStorageTotal',
            value: null,
            description: 'Total builds size'
        },
        {
            id: 'buildsTimeTotal',
            value: null,
            description: 'Total builds time'
        },
        {
            id: 'avgTime',
            value: null,
            description: 'Avg. builds time'
        },
        {
            id: 'success',
            value: null,
            description: 'Successful'
        },
        {
            id: 'failed',
            value: null,
            description: 'Failed '
        }
    ];
    onMount(async () => {
        await fetchUsage();
    });

    async function fetchUsage() {
        // Add timeout to make it look nicer
        setTimeout(async () => {
            metrics.forEach((metric) => {
                metric.value = null;
            });
            metrics = metrics;

            try {
                const usage = await sdk.forProject.sites.getUsage(page.params.site, range);
                metrics = metrics.map((metric) => {
                    metric.value = usage[metric.id] ?? '-';
                    return metric;
                });
                metrics = metrics;
                console.log(usage);
            } catch (error) {
                console.log(error);
            }
        }, 800);
    }
</script>

<Layout.Stack gap="xl">
    <Layout.Stack direction="row" justifyContent="space-between" alignItems="flex-end" wrap="wrap">
        <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
            Metrics for {range !== SiteUsageRange.TwentyFourHours
                ? `${toLocaleDate(
                      new Date(
                          now.getTime() - parseInt(range.split('d')[0]) * 24 * 60 * 60 * 1000
                      ).toString()
                  )} to`
                : ''}
            {toLocaleDate(now.toString())}
        </Typography.Text>
        <div>
            <InputSelect
                id="range"
                bind:value={range}
                options={rangeOptions}
                on:change={fetchUsage} />
        </div>
    </Layout.Stack>
    <Layout.Grid gap="m" columnsL={2} columns={1}>
        <Layout.Stack direction="row" gap="m">
            {#each metrics.slice(0, 3) as metric}
                <UsageCard description={metric.description} bind:value={metric.value} />
            {/each}
        </Layout.Stack>
        <Layout.Stack direction="row" gap="m">
            {#each metrics.slice(3) as metric}
                <UsageCard description={metric.description} bind:value={metric.value} />
            {/each}
        </Layout.Stack>
    </Layout.Grid>
</Layout.Stack>
