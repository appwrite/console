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
    {format(current)}
</div>
<div>Realtime Connections</div>
{#if total}
    <div style="height: 18em">
        <BarChart
            series={[
                {
                    name: 'Realtime connection',
                    data: $stats.get(projectId)
                }
            ]} />
    </div>
{:else}
    <Card>
        <div
            class="u-flex u-cross-center u-flex-vertical u-main-center u-flex"
            style="height: 10rem;">
            <span
                class="icon-chart-square-bar text-large"
                aria-hidden="true"
                style="font-size: var(--icon-size-large);" />
            <p class="u-bold">No data to show</p>
            <a
                class="link"
                href="https://appwrite.io/docs/realtime"
                target="_blank"
                rel="noopener noreferrer">Get started with Realtime</a>
        </div>
    </Card>
{/if}
