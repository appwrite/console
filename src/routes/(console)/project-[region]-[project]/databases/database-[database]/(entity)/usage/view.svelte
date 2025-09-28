<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Usage } from '$lib/layout';
    import type { Metric } from '$lib/sdk/usage';
    import Container from '$lib/layout/container.svelte';
    import { EntityContainer, type DatabaseType } from '$database/(entity)';

    let {
        total,
        count
    }: {
        total: number;
        count: Metric[];
        type?: DatabaseType;
    } = $props();
</script>

<EntityContainer>
    {#snippet children(_, __, terminology)}
        {@const records = terminology.record.lower.plural}
        {@const entity = terminology.entity.lower.singular}
        <div class="wide-screen-wrapper databases-spreadsheet">
            <!-- TODO: use resolve instead of base if possible -->
            <Container expanded slotSpacing paddingInlineEnd databasesScreen>
                <Usage
                    path={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/${entity}-${page.params[entity]}/usage`}
                    {total}
                    {count}
                    countMetadata={{
                        legend: records,
                        title: `Total ${records}`
                    }} />
            </Container>
        </div>
    {/snippet}
</EntityContainer>
