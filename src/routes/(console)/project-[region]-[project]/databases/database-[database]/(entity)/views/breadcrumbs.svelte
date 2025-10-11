<script lang="ts">
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { getTerminologies } from '$database/(entity)';
    import { resolveRoute, withPath } from '$lib/stores/navigation';

    const { terminology } = getTerminologies();

    const entity = terminology.entity;
    const entityType = terminology.entity.lower.singular;

    const database = $derived(page.data.database);

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
                title: database?.name ?? 'Database'
            },
            {
                href: withPath(databasePath, `/${entityType}-${entityId}`),
                title: entity.title.singular
            }
        ];
    });
</script>

<Breadcrumbs {breadcrumbs} />
