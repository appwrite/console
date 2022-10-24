<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { database } from './store';

    $: breadcrumbs = [
        {
            href: `/console/organization-${$organization.$id}`,
            title: $organization.name
        },
        {
            href: `/console/project-${$project.$id}`,
            title: $project.name
        },
        {
            href: `/console/project-${$project.$id}/databases`,
            title: 'Databases'
        },
        {
            href: `/console/project-${$project.$id}/databases/database/${$database.$id}`,
            title: $database.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
