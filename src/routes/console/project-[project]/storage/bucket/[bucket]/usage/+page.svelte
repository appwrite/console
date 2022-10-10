<script lang="ts">
    import { Container } from '$lib/layout';
    import { BarChart, LineChart } from '$lib/charts';
    import { Card, Tiles } from '$lib/components';
    import { bucketUsage } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';
    import { page } from '$app/stores';

    let currentRange = '30d';

    const bucketId = $page.params.bucket;

    $: bucketUsage.load(bucketId, currentRange);

    // TODO: metric type is wrong
    $: filesCount = $bucketUsage.filesCount as unknown as Models.Metric[];
    $: filesCreate = $bucketUsage.filesCreate as unknown as Models.Metric[];
    $: filesRead = $bucketUsage.filesRead as unknown as Models.Metric[];
    $: filesUpdate = $bucketUsage.filesUpdate as unknown as Models.Metric[];
    $: filesDelete = $bucketUsage.filesDelete as unknown as Models.Metric[];

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
        {#if filesCount}
            <h6 class="heading-level-6">{last(filesCount).value}</h6>
            <p>Total Files</p>
            <div class="u-margin-block-start-16" />
            <BarChart
                series={[
                    {
                        name: 'User',
                        data: [...filesCount.map((e) => [e.date, e.value])]
                    }
                ]} />
        {/if}
    </Card>
    <Tiles>
        <Card isTile>
            {#if filesCreate}
                <h6 class="heading-level-6">{total(filesCreate)}</h6>
                <p>Files created</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: 'Create',
                            data: [...filesCreate.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
        <Card isTile>
            {#if filesRead}
                <h6 class="heading-level-6">{total(filesRead)}</h6>
                <p>Files read</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: 'Read',
                            data: [...filesRead.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
        <Card isTile>
            {#if filesUpdate}
                <h6 class="heading-level-6">{total(filesUpdate)}</h6>
                <p>Files updated</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: 'Update',
                            data: [...filesUpdate.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
        <Card isTile>
            {#if filesDelete}
                <h6 class="heading-level-6">{total(filesDelete)}</h6>
                <p>Files deleted</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: 'Delete',
                            data: [...filesDelete.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
    </Tiles>
</Container>
