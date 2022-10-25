<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { key } from './store';
    console.log('asd');
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
            href: `/console/project-${$project?.$id}/overview/keys`,
            title: 'API Keys'
        },
        {
            href: `/console/project-${$project?.$id}/overview/keys/${$key?.$id}`,
            title: $key?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
