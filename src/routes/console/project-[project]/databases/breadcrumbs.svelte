<script lang="ts">
    import { page } from '$app/stores';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../store';

    $: breadcrumbs = [
        {
            href: `/console/organization-${$page.data.organization?.$id}`,
            title: $organization?.name
        },
        {
            href: `/console/project-${$page.data.project?.$id}`,
            title: $project?.name
        },
        {
            href: `/console/project-${$page.data.project?.$id}/databases`,
            title: 'Databases'
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
