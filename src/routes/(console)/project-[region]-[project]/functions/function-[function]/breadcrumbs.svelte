<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../store';
    import { func } from './store';
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
            href: getProjectRoute('/functions'),
            title: 'Functions'
        },
        {
            href: getProjectRoute(`/functions/function-${$func?.$id}`),
            title: $func?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
