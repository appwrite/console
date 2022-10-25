<script lang="ts">
    import { page } from '$app/stores';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { database } from './store';

    $: breadcrumbs = [
        {
            href: `/console/organization-${$organization.$id}`,
            title: $organization.name
        },
        {
            href: `/console/project-${$page.data.project.$id}`,
            title: $page.data.project.name
        },
        {
            href: `/console/project-${$page.data.project.$id}/databases`,
            title: 'Databases'
        },
        {
            href: `/console/project-${$page.data.project.$id}/databases/database-${$database.$id}`,
            title: $database.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
