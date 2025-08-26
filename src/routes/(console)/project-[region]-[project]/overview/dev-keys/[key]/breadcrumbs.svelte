<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { devKey } from './store';
    import { getProjectRoute } from '$lib/helpers/project';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization?.$id}`,
            title: $organization?.name
        },
        {
            href: getProjectRoute(),
            title: $project?.name
        },
        {
            href: getProjectRoute('/overview/dev-keys'),
            title: 'Dev keys'
        },
        {
            href: getProjectRoute(`/overview/dev-keys/${$devKey?.$id}`),
            title: $devKey?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
