<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { transfer } from './store';

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
            href: `/console/project-${$project?.$id}/settings/transfers/transfer-${$transfer?.$id}`,
            title: $transfer?.$id
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
