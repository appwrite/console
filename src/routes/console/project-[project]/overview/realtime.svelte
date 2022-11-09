<script lang="ts">
    import { page } from '$app/stores';
    import { BarChart } from '$lib/charts';
    import { Card } from '$lib/components';
    import { stats } from '../store';
    import { format } from './+layout.svelte';

    $: projectId = $page.params.project;
    $: projectStats = $stats?.get(projectId);
    $: current = projectStats ? projectStats[11][1] : 0;
    $: total = projectStats?.reduce((prev, next) => prev + next[1], 0) ?? 0;
</script>

<div class="heading-level-4">
    {format(34)}
</div>
<div>Realtime Connections</div>
<!-- {#if total} -->
    <div style="height: 18em">
        <BarChart
            series={[
                {
                    name: 'Realtime connection',
                    data: [
                        ['2022-08-16T00:00:00.000+00:00', 34],
                        ['2022-08-17T00:00:00.000+00:00', 24],
                        ['2022-08-18T00:00:00.000+00:00', 24],
                        ['2022-08-19T00:00:00.000+00:00', 35],
                        ['2022-08-20T00:00:00.000+00:00', 32],
                        ['2022-08-21T00:00:00.000+00:00', 39],
                        ['2022-08-22T00:00:00.000+00:00', 29],
                        ['2022-08-23T00:00:00.000+00:00', 45],
                        ['2022-08-24T00:00:00.000+00:00', 40],
                        ['2022-08-25T00:00:00.000+00:00', 30],
                        ['2022-08-26T00:00:00.000+00:00', 20],
                        ['2022-08-27T00:00:00.000+00:00', 34]
                    ]
                }
            ]} />
    </div>
<!-- {:else}
    <Card isDashed>
        <div
            class="u-flex u-cross-center u-flex-vertical u-main-center u-flex"
            style="height: 10rem;">
            <span
                class="icon-chart-square-bar text-large"
                aria-hidden="true"
                style="font-size: 32px;" />
            <p class="u-bold">No data to show</p>
            <a
                class="link"
                href="https://appwrite.io/docs/realtime"
                target="_blank"
                rel="noopener noreferrer">Get started with Realtime</a>
        </div>
    </Card>
{/if} -->
