<script lang="ts">
    import { Card, DropList, DropListItem } from '$lib/components';
    import { totalMetrics } from './+layout.svelte';
    import { usage } from './store';
    import type { UsagePeriods } from '$lib/layout';
    import { createEventDispatcher } from 'svelte';
    import { LineChart } from '$lib/charts';
    import { formatNum } from '$lib/helpers/string';
    import { ActionMenu, Icon, Layout, Link, Popover, Typography } from '@appwrite.io/pink-svelte';
    import { IconChevronDown } from '@appwrite.io/pink-icons-svelte';

    export let period: UsagePeriods;

    let showPeriod = false;

    const dispatch = createEventDispatcher();

    $: requests = $usage?.requests as unknown as Array<{
        date: number;
        value: number;
    }>;

    $: if (period) {
        showPeriod = false;
    }
</script>

<Layout.Stack justifyContent="space-between" direction="row" alignItems="flex-start">
    <div>
        <Typography.Title>
            {formatNum(totalMetrics($usage?.requests))}
        </Typography.Title>
        <Typography.Text>Requests</Typography.Text>
    </div>
    <Popover let:toggle padding="none">
        <Link.Button on:click={toggle} variant="quiet">
            <Layout.Stack direction="row" gap="none">
                <span>{period}</span>
                <Icon icon={IconChevronDown} />
            </Layout.Stack>
        </Link.Button>
        <ActionMenu.Root slot="tooltip">
            <ActionMenu.Item.Button on:click={() => dispatch('change', '24h')}
                >24h</ActionMenu.Item.Button>
            <ActionMenu.Item.Button on:click={() => dispatch('change', '30d')}
                >30d</ActionMenu.Item.Button>
            <ActionMenu.Item.Button on:click={() => dispatch('change', '90d')}
                >90d</ActionMenu.Item.Button>
        </ActionMenu.Root>
    </Popover>
</Layout.Stack>

{#if totalMetrics($usage?.requests) !== 0}
    <div style="height: 12rem;">
        <LineChart
            options={{
                yAxis: {
                    axisLabel: {
                        formatter: formatNum
                    }
                }
            }}
            series={[
                {
                    name: 'Requests',
                    data: [...requests.map((e) => [e.date, e.value])]
                }
            ]} />
    </div>
{:else}
    <Card isDashed>
        <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
            <span
                class="icon-chart-square-bar text-large"
                aria-hidden="true"
                style="font-size: 32px;" />
            <p class="u-bold">No data to show</p>
        </div>
    </Card>
{/if}
