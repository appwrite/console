<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Container, Usage } from '$lib/layout';

    let { data } = $props();
    let total = $derived(data.executionsTotal);
    let count = $derived(data.executions);
    let gbHoursTotal = $derived((data.buildsMbSecondsTotal + data.executionsMbSecondsTotal) / 1000 / 3600);
    let gbHoursCount = $derived([...data.buildsMbSeconds, ...data.executionsMbSeconds]
        ?.map((metric) => ({
            ...metric,
            value: metric.value / 1000 / 3600
        }))
        .filter(({ value }) => value));
</script>

<Container>
    <Usage
        path={`${base}/project-${page.params.region}-${page.params.project}/functions/usage`}
        countMetadata={{
            legend: 'Executions',
            title: 'executions'
        }}
        {total}
        {count} />
    
    <Usage
        hidePeriodSelect
        path={`${base}/project-${page.params.region}-${page.params.project}/functions/usage`}
        countMetadata={{
            legend: 'GB hours',
            title: 'GB hours'
        }}
        total={gbHoursTotal}
        count={gbHoursCount} />
</Container>
