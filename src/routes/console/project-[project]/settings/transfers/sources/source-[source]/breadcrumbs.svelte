<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../../store';
    import { source } from './store';

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
            href: `/console/project-${$project?.$id}/settings`,
            title: 'Settings'
        },
        {
            href: `/console/project-${$project?.$id}/settings/transfers`,
            title: 'Transfers'
        },
        {
            href: `/console/project-${$project?.$id}/settings/transfers/sources`,
            title: 'Sources'
        },
        {
            href: `/console/project-${$project?.$id}/settings/transfers/sources/source-${$source?.$id}`,
            title: $source?.$id
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
