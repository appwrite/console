<script lang="ts">
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import { resolveRoute } from '$lib/stores/navigation';

    const breadcrumbs = $derived.by(() => {
        const params = page.params;
        const project = page.data.project;
        const database = page.data.database;
        const organization = page.data.organization as Models.Organization;

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
