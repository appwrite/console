<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { platform } from './store';

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
            href: `/console/project-${$project.$id}/overview/platforms`,
            title: 'Platforms'
        },
        {
            href: `/console/project-${$project.$id}/overview/platforms/${$platform.$id}`,
            title: $platform.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
