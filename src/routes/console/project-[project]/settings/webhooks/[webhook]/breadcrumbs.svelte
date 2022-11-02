<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { webhook } from './store';

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
            href: `/console/project-${$project?.$id}/settings/webhooks`,
            title: 'Settings'
        },
        {
            href: `/console/project-${$project?.$id}/settings/webhooks/webhook/${$webhook?.$id}`,
            title: $webhook?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
