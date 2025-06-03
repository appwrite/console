<script lang="ts">
    import { page } from '$app/state';
    import { BarChart } from '$lib/charts';
    import { Card } from '$lib/components';
    import { formatNum } from '$lib/helpers/string';
    import { Icon, Layout, Link, Typography } from '@appwrite.io/pink-svelte';
    import { stats } from '../store';
    import { IconChartSquareBar } from '@appwrite.io/pink-icons-svelte';

    $: projectId = page.params.project;
    $: projectStats = $stats?.get(projectId);
    $: current = projectStats ? projectStats[11][1] : 0;
    $: total = projectStats?.reduce((prev, next) => prev + next[1], 0) ?? 0;
</script>

<Layout.Stack gap="l">
    <div class="heading-level-4">
        {formatNum(current)}
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
        <Card isDashed>
            <Layout.Stack gap="xs" alignItems="center" justifyContent="center" height="10rem">
                <Icon icon={IconChartSquareBar} size="l" />
                <Typography.Text variant="m-600">No data to show</Typography.Text>
                <Link.Anchor
                    href="https://appwrite.io/docs/apis/realtime"
                    target="_blank"
                    rel="noopener noreferrer">Get started with Realtime</Link.Anchor>
            </Layout.Stack>
        </Card>
    {/if}
</Layout.Stack>
