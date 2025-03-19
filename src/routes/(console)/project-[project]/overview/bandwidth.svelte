<script lang="ts">
    import { Card } from '$lib/components';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { totalMetrics } from './+layout.svelte';
    import { usage } from './store';
    import type { UsagePeriods } from '$lib/layout';
    import { createEventDispatcher } from 'svelte';
    import { BarChart } from '$lib/charts';
    import {
        Popover,
        Typography,
        Icon,
        ActionMenu,
        Layout,
        Button
    } from '@appwrite.io/pink-svelte';
    import {
        IconChartSquareBar,
        IconChevronDown,
        IconChevronUp
    } from '@appwrite.io/pink-icons-svelte';

    export let period: UsagePeriods;

    const dispatch = createEventDispatcher();

    $: network = $usage?.network as unknown as Array<{
        date: number;
        value: number;
    }>;

    $: bandwidth = humanFileSize(totalMetrics($usage?.network));
</script>

<Layout.Stack justifyContent="space-between" direction="row" alignItems="flex-start">
    <div>
        <Typography.Title>
            {bandwidth.value}
            <span class="body-text-2">{bandwidth.unit}</span>
        </Typography.Title>
        <Typography.Text>Bandwidth</Typography.Text>
    </div>
    <Popover let:toggle padding="none" let:showing>
        <Button.Button on:click={toggle} variant="extra-compact">
            {period}
            <Icon icon={showing ? IconChevronUp : IconChevronDown} slot="end" />
        </Button.Button>
        <svelte:fragment slot="tooltip">
            <ActionMenu.Root>
                <ActionMenu.Item.Button on:click={() => dispatch('change', '24h')}
                    >24h</ActionMenu.Item.Button>
                <ActionMenu.Item.Button on:click={() => dispatch('change', '30d')}
                    >30d</ActionMenu.Item.Button>
                <ActionMenu.Item.Button on:click={() => dispatch('change', '90d')}
                    >90d</ActionMenu.Item.Button>
            </ActionMenu.Root>
        </svelte:fragment>
    </Popover>
</Layout.Stack>
{#if bandwidth.value !== '0'}
    <div style="height: 12rem;">
        <BarChart
            options={{
                yAxis: {
                    axisLabel: {
                        formatter: (value) =>
                            value
                                ? `${humanFileSize(+value).value} ${humanFileSize(+value).unit}`
                                : '0'
                    }
                }
            }}
            series={[
                {
                    name: 'Bandwidth',
                    data: [...network.map((e) => [e.date, e.value])],
                    tooltip: {
                        valueFormatter: (value) =>
                            `${humanFileSize(+value).value} ${humanFileSize(+value).unit}`
                    }
                }
            ]} />
    </div>
{:else}
    <Card isDashed>
        <Layout.Stack gap="xs" alignItems="center" justifyContent="center">
            <Icon icon={IconChartSquareBar} size="l" />
            <Typography.Text variant="m-600">No data to show</Typography.Text>
        </Layout.Stack>
    </Card>
{/if}
