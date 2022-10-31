<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../store';
    import { func } from './store';

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
            href: `/console/project-${$project?.$id}/functions`,
            title: 'Functions'
        },
        {
            href: `/console/project-${$project?.$id}/functions/function-${$func?.$id}`,
            title: $func?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
