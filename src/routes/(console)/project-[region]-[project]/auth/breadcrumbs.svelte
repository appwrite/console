<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../store';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization?.$id}`,
            title: $organization?.name
        },
        {
            href: `${base}/project-${$project.region}-${$project?.$id}`,
            title: $project?.name
        },
        {
            href: `${base}/project-${$project.region}-${$project?.$id}/auth`,
            title: 'Auth'
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
