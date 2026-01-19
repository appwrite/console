<script lang="ts">
    import { page } from '$app/state';
    import { Usage } from '$lib/layout';
    import type { Metric } from '$lib/sdk/usage';
    import Container from '$lib/layout/container.svelte';
    import { resolveRoute, withPath } from '$lib/stores/navigation';
    import { getTerminologies } from '$database/(entity)';

    let {
        total,
        count
    }: {
        total: number;
        count: Metric[];
    } = $props();

    const { terminology } = getTerminologies();

    const records = terminology.record.lower.plural;
    const entity = terminology.entity.lower.singular;

    const usagePath = $derived(
        withPath(
            // base path
            resolveRoute(
                '/(console)/project-[region]-[project]/databases/database-[database]',
                page.params
            ),

            // append dynamic path
            `${entity}-${page.params[entity]}/usage`
        )
    );
</script>

<div class="wide-screen-wrapper databases-spreadsheet">
    <Container expanded slotSpacing paddingInlineEnd databasesScreen>
        <Usage
            {total}
            {count}
            path={usagePath}
            countMetadata={{
                legend: records,
                title: `Total ${records}`
            }} />
    </Container>
</div>
