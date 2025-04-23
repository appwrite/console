<script lang="ts">
    import { Container, Usage } from '$lib/layout';
    import { page } from '$app/state';
    import type { PageData } from './$types';
    import { base } from '$app/paths';
    import { Layout } from '@appwrite.io/pink-svelte';

    export let data: PageData;
    $: total = data.executionsTotal;
    $: count = data.executions;
    $: gbHoursTotal = data.executionsMbSecondsTotal / 1000 / 3600;
    $: mbSecondsCount = data.executionsMbSeconds;
</script>

<Container>
    <Layout.Stack gap="l">
        {#if count}
            <Usage
                path={`${base}/project-${page.params.project}/functions/function-${page.params.function}/usage`}
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
                path={`${base}/project-${page.params.project}/functions/function-${page.params.function}/usage`}
                countMetadata={{
                    legend: 'GB hours',
                    title: 'Total GB hours'
                }}
                total={gbHoursTotal}
                count={mbSecondsCount} />
        {/if}
    </Layout.Stack>
</Container>
