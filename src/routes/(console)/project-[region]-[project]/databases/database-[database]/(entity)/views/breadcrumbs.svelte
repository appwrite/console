<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { database } from '$database/store';
    import { useTerminology } from '$database/(entity)';

    const terminology = $derived(useTerminology(page));
    const entity = $derived(terminology.entity);
    const entityType = $derived(terminology.entity.lower.singular);

    const breadcrumbs = $derived.by(() => {
        const entityId = page.params[entityType];
        const { region, project, database: databaseId } = page.params;

        const projectPath = `${base}/project-${region}-${project}`;
        const databasePath = `${projectPath}/databases/database-${databaseId}`;

        return [
            {
                title: '...'
            },
            {
                href: `${projectPath}/databases`,
                title: 'Databases'
            },
            {
                href: databasePath,
                title: $database?.name ?? 'Database'
            },
            {
                href: `${databasePath}/${entityType}-${entityId}`,
                title: entity.title.singular
            }
        ];
    });
</script>

<Breadcrumbs {breadcrumbs} />
