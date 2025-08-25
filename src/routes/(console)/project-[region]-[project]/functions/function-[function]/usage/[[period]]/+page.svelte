<script lang="ts">
    import { page } from '$app/state';
    import { Container, Usage } from '$lib/layout';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { getProjectRoute } from '$lib/helpers/project';

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
                path={getProjectRoute(`/functions/function-${page.params.function}/usage`)}
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
                path={getProjectRoute(`/functions/function-${page.params.function}/usage`)}
                countMetadata={{
                    legend: 'GB hours',
                    title: 'Total GB hours'
                }}
                total={gbHoursTotal}
                count={gbHoursCount} />
        {/if}
    </Layout.Stack>
</Container>
