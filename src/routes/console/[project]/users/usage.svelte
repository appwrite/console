<script>
    import { Container } from '$lib/layout';
    import { Chart } from '$lib/charts';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Card } from '$lib/components';

    let currentTimeframe = '30d';

    const getUsage = async (timeFrame) => await sdkForProject.users.getUsage(timeFrame);
    //TODO: add types once they are fixed
</script>

<Container>
    {#await getUsage(currentTimeframe)}
        Loading...
    {:then res}
        <button on:click={() => console.log(res)}>sadasd</button>
        <ul class="drop-tabs">
            <li class="drop-tabs-item">
                <button
                    class="drop-tabs-button"
                    on:click={() => (currentTimeframe = '24h')}
                    disabled={currentTimeframe === '24h'}>
                    <span class="text">24h</span>
                </button>
            </li>
            <li class="drop-tabs-item">
                <button
                    class="drop-tabs-button"
                    on:click={() => (currentTimeframe = '30d')}
                    disabled={currentTimeframe === '30d'}>
                    <span class="text">30d</span>
                </button>
            </li>
            <li class="drop-tabs-item">
                <button
                    class="drop-tabs-button"
                    on:click={() => (currentTimeframe = '90d')}
                    disabled={currentTimeframe === '90d'}>
                    <span class="text">90d</span>
                </button>
            </li>
        </ul>
        <Card>
            <h6 class="heading-level-6">Users</h6>
            <p>Count of users over time</p>
            <Chart
                title="Users"
                series={[
                    {
                        name: 'User',
                        data: [...res.usersCount.map((e) => [e.date * 1000, e.value])],
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
                        data: [...res.usersCreate.map((e) => [e.date * 1000, e.value])],
                        type: 'line',
                        smooth: true,
                        areaStyle: {}
                    },
                    {
                        name: 'Read',
                        data: [...res.usersRead.map((e) => [e.date * 1000, e.value])],
                        type: 'line',
                        smooth: true,
                        areaStyle: {}
                    },
                    {
                        name: 'Update',
                        data: [...res.usersUpdate.map((e) => [e.date * 1000, e.value])],
                        type: 'line',
                        smooth: true,
                        areaStyle: {}
                    },
                    {
                        name: 'Delete',
                        data: [...res.usersDelete.map((e) => [e.date * 1000, e.value])],
                        type: 'line',
                        smooth: true,
                        areaStyle: {}
                    }
                ]} />
        </Card>
    {/await}
</Container>
