<script lang="ts">
    import { InputSelect } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { sdk } from '$lib/stores/sdk';
    import { SiteUsageRange } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { UsageCard } from '$lib/components';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';

    const now = new Date();
    const rangeOptions = [
        { value: SiteUsageRange.TwentyFourHours, label: 'Last 24 hours' },
        { value: SiteUsageRange.ThirtyDays, label: 'Last 30 days' },
        { value: SiteUsageRange.NinetyDays, label: 'Last 90 days' }
    ];

    let range = SiteUsageRange.ThirtyDays;
    let metrics: { id: string; value: string | null; description: string }[] = [
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
            id: 'buildsTimeAverage',
            value: null,
            description: 'Avg. builds time'
        },
        {
            id: 'buildsSuccessTotal',
            value: null,
            description: 'Successful'
        },
        {
            id: 'buildsFailedTotal',
            value: null,
            description: 'Failed '
        }
    ];
    onMount(async () => {
        await fetchUsage();
    });

    async function fetchUsage() {
        metrics = metrics.map((metric) => {
            metric.value = null;

            return metric;
        });

        // Add timeout to make it look nicer
        setTimeout(async () => {
            try {
                const usage = await sdk
                    .forProject(page.params.region, page.params.project)
                    .sites.getUsage(page.params.site, range);
                metrics = metrics.map((metric) => {
                    if (metric.id === 'buildsStorageTotal') {
                        const size = humanFileSize(usage[metric.id]);

                        metric.value = parseInt(size?.value) > 0 ? size.value + size.unit : '-';
                    } else if (
                        metric.id === 'buildsTimeTotal' ||
                        metric.id === 'buildsTimeAverage'
                    ) {
                        const seconds = usage[metric.id] > 0 ? usage[metric.id] / 1000 : 0;
                        const time = formatTimeDetailed(seconds);

                        metric.value = time !== '0s' ? time : '-';
                    } else {
                        metric.value = usage[metric.id] ?? '-';
                    }
                    return metric;
                });
            } catch {
                return;
            }
        }, 500);
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
