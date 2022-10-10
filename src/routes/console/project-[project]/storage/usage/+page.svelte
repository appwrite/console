<script lang="ts">
    import { Container } from '$lib/layout';
    import { BarChart, LineChart } from '$lib/charts';
    import { Card, Tiles } from '$lib/components';
    import { storageUsage } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';

    let currentRange = '30d';

    $: storageUsage.load(currentRange);

    // TODO: metric type is wrong
    $: bucketsCount = $storageUsage.bucketsCount as unknown as Models.Metric[];
    $: bucketsCreate = $storageUsage.bucketsCreate as unknown as Models.Metric[];
    $: bucketsRead = $storageUsage.bucketsRead as unknown as Models.Metric[];
    $: bucketsUpdate = $storageUsage.bucketsUpdate as unknown as Models.Metric[];
    $: bucketsDelete = $storageUsage.bucketsDelete as unknown as Models.Metric[];

    function last(set: Array<unknown>): Models.Metric | null {
        return (set as Models.Metric[]).slice(-1)[0] ?? null;
    }

    // TODO: metric type is wrong
    function total(set: Array<unknown>): number {
        return (set as Models.Metric[]).reduce((prev, curr) => prev + curr.value, 0);
    }
</script>

<Container>
    <div class="u-flex u-main-space-between common-section">
        <h2 class="heading-level-5">Users</h2>
        <ul class="drop-tabs">
            <li class="drop-tabs-item">
                <button
                    class="drop-tabs-button"
                    on:click={() => (currentRange = '24h')}
                    disabled={currentRange === '24h'}>
                    <span class="text">24h</span>
                </button>
            </li>
            <li class="drop-tabs-item">
                <button
                    class="drop-tabs-button"
                    on:click={() => (currentRange = '30d')}
                    disabled={currentRange === '30d'}>
                    <span class="text">30d</span>
                </button>
            </li>
            <li class="drop-tabs-item">
                <button
                    class="drop-tabs-button"
                    on:click={() => (currentRange = '90d')}
                    disabled={currentRange === '90d'}>
                    <span class="text">90d</span>
                </button>
            </li>
        </ul>
    </div>
    <Card>
        {#if bucketsCount}
            <h6 class="heading-level-6">{last(bucketsCount).value}</h6>
            <p>Total Buckets</p>
            <div class="u-margin-block-start-16" />
            <BarChart
                series={[
                    {
                        name: 'User',
                        data: [...bucketsCount.map((e) => [e.date, e.value])]
                    }
                ]} />
        {/if}
    </Card>
    <Tiles>
        <Card isTile>
            {#if bucketsCreate}
                <h6 class="heading-level-6">{total(bucketsCreate)}</h6>
                <p>Buckets created</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: 'Create',
                            data: [...bucketsCreate.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
        <Card isTile>
            {#if bucketsRead}
                <h6 class="heading-level-6">{total(bucketsRead)}</h6>
                <p>Buckets read</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: 'Read',
                            data: [...bucketsRead.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
        <Card isTile>
            {#if bucketsUpdate}
                <h6 class="heading-level-6">{total(bucketsUpdate)}</h6>
                <p>Buckets updated</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: 'Update',
                            data: [...bucketsUpdate.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
        <Card isTile>
            {#if bucketsDelete}
                <h6 class="heading-level-6">{total(bucketsDelete)}</h6>
                <p>Buckets deleted</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: 'Delete',
                            data: [...bucketsDelete.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
    </Tiles>
</Container>
