<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { team } from './store';

    $: breadcrumbs = [
        {
            href: `/console/organization-${$organization?.$id}`,
            title: $organization?.name
        },
        {
            href: `/console/project-${$project.$id}`,
            title: $project?.name
        },
        {
            href: `/console/project-${$project?.$id}/auth`,
            title: 'Authentication'
        },
        {
            href: `/console/project-${$project?.$id}/auth/teams-${$team?.$id}`,
            title: $team?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
