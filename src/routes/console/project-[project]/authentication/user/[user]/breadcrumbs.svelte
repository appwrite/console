<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { user } from './store';

    $: breadcrumbs = [
        {
            href: `/console/organization-${$organization?.$id}`,
            title: $organization?.name
        },
        {
            href: `/console/project-${$project?.$id}`,
            title: $project?.name
        },
        {
            href: `/console/project-${$project?.$id}/authentication`,
            title: 'Authentication'
        },
        {
            href: `/console/project-${$project?.$id}/authentication/user/${$user?.$id}`,
            title: $user?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
