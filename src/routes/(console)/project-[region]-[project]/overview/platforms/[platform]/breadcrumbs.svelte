<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { platform } from './store';
    import { getProjectRoute } from '$lib/helpers/project';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization.$id}`,
            title: $organization.name
        },
        {
            href: getProjectRoute(),
            title: $project.name
        },
        {
            href: getProjectRoute('/overview/platforms'),
            title: 'Platforms'
        },
        {
            href: getProjectRoute(`/overview/platforms/${$platform.$id}`),
            title: $platform.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
