<script lang="ts">
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { resolveRoute } from '$lib/stores/navigation';

    const breadcrumbs = $derived.by(() => {
        const project = page.data.project;
        const organization = page.data.organization;
        const organizationId = organization?.$id ?? project.teamId;

        return [
            {
                href: resolveRoute('/(console)/organization-[organization]', {
                    organization: organizationId
                }),
                title: organization?.name
            },
            {
                href: resolveRoute('/(console)/project-[region]-[project]', page.params),
                title: project?.name
            },
            {
                href: resolveRoute('/(console)/project-[region]-[project]/databases', page.params),
                title: 'Databases'
            }
        ];
    });
</script>

<Breadcrumbs {breadcrumbs} />
