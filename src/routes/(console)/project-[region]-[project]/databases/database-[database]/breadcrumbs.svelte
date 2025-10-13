<script lang="ts">
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { resolveRoute } from '$lib/stores/navigation';
    import { type Organization } from '$lib/stores/organization';

    const breadcrumbs = $derived.by(() => {
        const params = page.params;
        const project = page.data.project;
        const database = page.data.database;
        const organization = page.data.organization as Organization;

        return [
            {
                href: resolveRoute('/(console)/organization-[organization]', {
                    organization: organization?.$id ?? project.teamId
                }),
                title: organization.name
            },
            {
                href: resolveRoute('/(console)/project-[region]-[project]', params),
                title: project.name
            },
            {
                href: resolveRoute('/(console)/project-[region]-[project]/databases', params),
                title: 'Databases'
            },
            {
                href: resolveRoute(
                    '/(console)/project-[region]-[project]/databases/database-[database]',
                    params
                ),
                title: database.name
            }
        ];
    });
</script>

<Breadcrumbs {breadcrumbs} />
