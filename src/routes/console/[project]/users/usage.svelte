<script>
    import { Container } from '$lib/layout';
    import { Chart } from '$lib/charts';
    import { Card } from '$lib/components';
    import { usersUsage } from './store';

    let currentRange = '30d';

    $: usersUsage.load(currentRange);
    $: data = $usersUsage.response;

    //TODO: add types once they are fixed
</script>

<Container>
    {#if data}
        <div class="u-flex u-main-end common-section">
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
            <h6 class="heading-level-6">Users</h6>
            <p>Count of users over time</p>
            <Chart
                title="Users"
                series={[
                    {
                        name: 'User',
                        data: [...data.usersCount.map((e) => [e.date * 1000, e.value])],
                        type: 'line',
                        smooth: true,
                        areaStyle: {}
                    }
                ]} />
        </Card>
        <Card>
            <h6 class="heading-level-6">Operations</h6>
            <p>Count of users create, read, update and delete operations over time</p>
            <Chart
                title="Operations"
                series={[
                    {
                        name: 'Create',
                        data: [...data.usersCreate.map((e) => [e.date * 1000, e.value])],
                        type: 'line',
                        smooth: true,
                        areaStyle: {}
                    },
                    {
                        name: 'Read',
                        data: [...data.usersRead.map((e) => [e.date * 1000, e.value])],
                        type: 'line',
                        smooth: true,
                        areaStyle: {}
                    },
                    {
                        name: 'Update',
                        data: [...data.usersUpdate.map((e) => [e.date * 1000, e.value])],
                        type: 'line',
                        smooth: true,
                        areaStyle: {}
                    },
                    {
                        name: 'Delete',
                        data: [...data.usersDelete.map((e) => [e.date * 1000, e.value])],
                        type: 'line',
                        smooth: true,
                        areaStyle: {}
                    }
                ]} />
        </Card>
    {/if}
</Container>
