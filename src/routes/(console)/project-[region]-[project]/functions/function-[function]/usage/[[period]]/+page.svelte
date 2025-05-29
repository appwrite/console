<script lang="ts">
    import { page } from '$app/state';
    import { Container, Usage } from '$lib/layout';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data;
    $: count = data.executions;
    $: total = data.executionsTotal;
    $: mbSecondsCount = data.executionsMbSeconds;
    $: gbHoursTotal = data.executionsMbSecondsTotal / 1000 / 3600;
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
                count={mbSecondsCount} />
        {/if}
    </Layout.Stack>
</Container>
