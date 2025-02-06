<script lang="ts">
    import { InputSelect } from '$lib/elements/forms';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import UsageCard from './usageCard.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { SiteUsageRange, type Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    export let deploymentList: Models.DeploymentList;
    let range = SiteUsageRange.ThirtyDays;
    const rangeOptions = [
        { value: SiteUsageRange.TwentyFourHours, label: 'Last 24 hours' },
        { value: SiteUsageRange.ThirtyDays, label: 'Last 30 days' },
        { value: SiteUsageRange.NinetyDays, label: 'Last 90 days' }
    ];
    const now = new Date();
    let metrics = [
        {
            id: 'buildsTotal',
            value: null,
            description: 'Total build count'
        },
        {
            id: 'buildsStorageTotal',
            value: null,
            description: 'Total build size'
        },
        {
            id: 'buildsTimeTotal',
            value: null,
            description: 'Total build time'
        },
        {
            id: 'avgTime',
            value: null,
            description: 'Average build time'
        },
        {
            id: 'success',
            value: null,
            description: 'Successful deployment'
        },
        {
            id: 'failed',
            value: null,
            description: 'Failed deployment'
        }
    ];
    onMount(async () => {
        if (deploymentList.total) {
            await fetchUsage();
        }
    });

    async function fetchUsage() {
        metrics.forEach((metric) => {
            metric.value = null;
        });
        metrics = metrics;
        try {
            const usage = await sdk.forProject.sites.getSiteUsage($page.params.site, range);
            metrics = metrics.map((metric) => {
                metric.value = usage[metric.id];
                return metric;
            });
            metrics = metrics;
            console.log(usage);
        } catch (error) {
            console.log(error);
        }
    }

    $: console.log(metrics);
</script>

<Layout.Stack gap="xl">
    <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
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
    <Layout.Stack direction="row">
        {#each metrics as metric}
            <UsageCard description={metric.description} bind:value={metric.value} />
        {/each}
    </Layout.Stack>
</Layout.Stack>
