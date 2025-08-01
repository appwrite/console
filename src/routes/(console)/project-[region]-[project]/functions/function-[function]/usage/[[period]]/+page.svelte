<script lang="ts">
    import { Container, Usage } from '$lib/layout';
    import { page } from '$app/state';
    import { base } from '$app/paths';
    import { Layout } from '@appwrite.io/pink-svelte';

    export let data;
    $: total = data.executionsTotal;
    $: count = data.executions;
    $: gbHoursTotal = data.executionsMbSecondsTotal / 1000 / 3600;
    $: mbSecondsCount = data.executionsMbSeconds;
    $: gbHoursCount = data.executionsMbSeconds
        ?.map((metric) => ({
            ...metric,
            value: metric.value / 1000 / 3600
        }))
        .filter(({ value }) => value);
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
                {total}
                {count} />
        {/if}

        {#if mbSecondsCount}
            <Usage
                hidePeriodSelect
                path={`${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/usage`}
                countMetadata={{
                    legend: 'GB hours',
                    title: 'Total GB hours'
                }}
                total={gbHoursTotal}
                count={gbHoursCount} />
        {/if}
    </Layout.Stack>
</Container>
