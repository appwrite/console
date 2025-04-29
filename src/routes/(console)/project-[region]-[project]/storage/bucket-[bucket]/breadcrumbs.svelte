<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../store';
    import { bucket } from './store';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization?.$id}`,
            title: $organization.name
        },
        {
            href: `${base}/project-${$project?.$id}`,
            title: $project.name
        },
        {
            href: `${base}/project-${$project?.$id}/storage`,
            title: 'Storage'
        },
        {
            href: `${base}/project-${$project?.$id}/storage/bucket-${$bucket?.$id}`,
            title: $bucket?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
