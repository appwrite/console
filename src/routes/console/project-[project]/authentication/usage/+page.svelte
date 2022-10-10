<script lang="ts">
    import { Container } from '$lib/layout';
    import { BarChart, LineChart } from '$lib/charts';
    import { Card, Tiles } from '$lib/components';
    import { usersUsage } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';

    let currentRange = '30d';

    $: usersUsage.load(currentRange);

    // TODO: metric type is wrong
    $: usersCount = $usersUsage.usersCount as unknown as Models.Metric[];
    $: usersCreate = $usersUsage.usersCreate as unknown as Models.Metric[];
    $: usersRead = $usersUsage.usersRead as unknown as Models.Metric[];
    $: usersUpdate = $usersUsage.usersUpdate as unknown as Models.Metric[];
    $: usersDelete = $usersUsage.usersDelete as unknown as Models.Metric[];

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
        {#if usersCount}
            <h6 class="heading-level-6">{last(usersCount).value}</h6>
            <p>Registered users</p>
            <div class="u-margin-block-start-16" />
            <BarChart
                series={[
                    {
                        name: 'User',
                        data: [...usersCount.map((e) => [e.date, e.value])]
                    }
                ]} />
        {/if}
    </Card>
    <Tiles>
        <Card isTile>
            {#if usersCreate}
                <h6 class="heading-level-6">{total(usersCreate)}</h6>
                <p>Users created</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: 'Create',
                            data: [...usersCreate.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
        <Card isTile>
            {#if usersRead}
                <h6 class="heading-level-6">{total(usersRead)}</h6>
                <p>Users read</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: 'Read',
                            data: [...usersRead.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
        <Card isTile>
            {#if usersUpdate}
                <h6 class="heading-level-6">{total(usersUpdate)}</h6>
                <p>Users updated</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: 'Update',
                            data: [...usersUpdate.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
        <Card isTile>
            {#if usersDelete}
                <h6 class="heading-level-6">{total(usersDelete)}</h6>
                <p>Users deleted</p>
                <div class="u-margin-block-start-16" />
                <LineChart
                    series={[
                        {
                            name: 'Delete',
                            data: [...usersDelete.map((e) => [e.date, e.value])]
                        }
                    ]} />
            {/if}
        </Card>
    </Tiles>
</Container>
