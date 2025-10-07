<script lang="ts">
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { database } from '$database/store';
    import { getTerminologies } from '$database/(entity)';
    import { resolveRoute } from '$lib/stores/navigation';

    const { terminology } = getTerminologies();

    const entity = terminology.entity;
    const entityType = terminology.entity.lower.singular;

    const breadcrumbs = $derived.by(() => {
        const params = page.params;
        const entityId = params[entityType];
        const databases = resolveRoute('/(console)/project-[region]-[project]/databases', params);
        const databasePath = resolveRoute(
            `/(console)/project-[region]-[project]/databases/database-[database]`,
            params
        );

        return [
            {
                title: '...'
            },
            {
                href: databases,
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
