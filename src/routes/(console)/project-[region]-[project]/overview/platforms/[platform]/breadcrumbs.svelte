<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { platform } from './store';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization.$id}`,
            title: $organization.name
        },
        {
            href: `${base}/project-${$project.region}-${$project.$id}`,
            title: $project.name
        },
        {
            href: `${base}/project-${$project.region}-${$project.$id}/overview/platforms`,
            title: 'Platforms'
        },
        {
            href: `${base}/project-${$project.region}-${$project.$id}/overview/platforms/${$platform.$id}`,
            title: $platform.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
