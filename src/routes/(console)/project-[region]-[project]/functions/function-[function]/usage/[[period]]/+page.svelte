<script lang="ts">
    import { Container, Usage } from '$lib/layout';
    import { page } from '$app/state';
    import { base } from '$app/paths';
    import { Layout } from '@appwrite.io/pink-svelte';

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
    <Layout.Stack gap="l">
        <Usage
            path={`${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/usage`}
            countMetadata={{
                legend: 'Executions',
                title: 'executions'
            }}
            {total}
            {count} />

        <Usage
            hidePeriodSelect
            path={`${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/usage`}
            countMetadata={{
                legend: 'GB hours',
                title: 'GB hours'
            }}
            total={gbHoursTotal}
            count={gbHoursCount} />
    </Layout.Stack>
</Container>
