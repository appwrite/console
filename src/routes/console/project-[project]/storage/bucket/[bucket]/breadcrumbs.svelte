<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { bucket } from './store';

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
            href: `/console/project-${$project.$id}/storage`,
            title: 'Storage'
        },
        {
            href: `/console/project-${$project.$id}/storage/bucket/${$bucket.$id}`,
            title: $bucket.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
