<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Container, UsageMultiple } from '$lib/layout';
    import { InputSelect } from '$lib/elements/forms';
    import { Layout } from '@appwrite.io/pink-svelte';
    import type { PageData } from './$types';

    export let data: PageData;

    $: reads = data.databasesReads;

    $: writes = data.databasesWrites;

    $: usagePath = `${base}/project-${page.params.region}-${page.params.project}/databases/usage`;
</script>

<Container>
    <Layout.Stack gap="l">
        <div
            style:max-width="250px"
            style:--input-background-color="var(--bgcolor-neutral-primary)">
            <InputSelect
                on:change={(e) => goto(`${usagePath}/${e.detail}`)}
                id="period"
                options={[
                    {
                        label: '24 hours',
                        value: '24h'
                    },
                    {
                        label: '30 days',
                        value: '30d'
                    },
                    {
                        label: '90 days',
                        value: '90d'
                    }
                ]}
                value={page.params.period ?? '30d'} />
        </div>

        <UsageMultiple
            title="Reads and writes"
            description="Reads and writes per day"
            showHeader={false}
            count={[reads, writes]}
            seriesNames={['Reads', 'Writes']} />
    </Layout.Stack>
</Container>
