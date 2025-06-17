<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { key } from './store';
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
            href: getProjectRoute('/overview/keys'),
            title: 'API keys'
        },
        {
            href: getProjectRoute(`/overview/keys/${$key?.$id}`),
            title: $key?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
