<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { clampMin } from '$lib/helpers/numbers';
    import { Container, Usage } from '$lib/layout';
    import { Layout } from '@appwrite.io/pink-svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    const count = $derived(data.executions ?? []);
    const total = $derived(clampMin(count.reduce((sum, metric) => sum + metric.value, 0)));

    // Function compute time is returned as MB-seconds and displayed as GB-hours.
    const executionsTime = $derived(data.executionsTime ?? []);
    const gbHoursCount = $derived(
        executionsTime
            .map((metric) => ({
                ...metric,
                value: metric.value / 1000 / 3600
            }))
            .filter(({ value }) => value)
    );
    const gbHoursTotal = $derived(
        clampMin(gbHoursCount.reduce((sum, metric) => sum + metric.value, 0))
    );
</script>

<Container>
    <Layout.Stack gap="l">
        {#if count}
            <Usage
                path={`${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/usage`}
                countMetadata={{
                    legend: 'Executions',
                    title: 'Total executions'
                }}
                isCumulative
                {total}
                {count} />
        {/if}

        {#if executionsTime.length}
            <Usage
                hidePeriodSelect
                path={`${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/usage`}
                countMetadata={{
                    legend: 'GB hours',
                    title: 'Total GB hours'
                }}
                isCumulative
                total={gbHoursTotal}
                count={gbHoursCount} />
        {/if}
    </Layout.Stack>
</Container>
