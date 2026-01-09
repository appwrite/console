<script lang="ts">
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { resolveRoute } from '$lib/stores/navigation';
    import { type Organization } from '$lib/stores/organization';

    const params = $derived(page.params);
    const project = $derived(page.data.project);
    const database = $derived(page.data.database);
    const organization = $derived(page.data.organization) as Organization;

    const breadcrumbs = $derived([
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
    ]);
</script>

<Breadcrumbs {breadcrumbs} />
