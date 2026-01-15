<script lang="ts">
    import { resolve } from '$app/paths';
    import { page } from '$app/state';
    import { Container, Usage } from '$lib/layout';

    let { data } = $props();
    let total = $derived(data.executionsTotal);
    let count = $derived(data.executions);
    let gbHoursTotal = $derived(
        (data.buildsMbSecondsTotal + data.executionsMbSecondsTotal) / 1000 / 3600
    );
    let gbHoursCount = $derived(
        [...data.buildsMbSeconds, ...data.executionsMbSeconds]
            ?.map((metric) => ({
                ...metric,
                value: metric.value / 1000 / 3600
            }))
            .filter(({ value }) => value)
    );

    const path = $derived(
        resolve('/(console)/project-[region]-[project]/functions/usage', {
            region: page.params.region,
            project: page.params.project
        })
    );
</script>

<Container>
    <Usage
        {path}
        countMetadata={{
            legend: 'Executions',
            title: 'executions'
        }}
        {total}
        {count} />

    <Usage
        hidePeriodSelect
        {path}
        countMetadata={{
            legend: 'GB hours',
            title: 'GB hours'
        }}
        total={gbHoursTotal}
        count={gbHoursCount} />
</Container>
