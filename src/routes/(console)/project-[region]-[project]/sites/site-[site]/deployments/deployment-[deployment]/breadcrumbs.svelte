<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../../store';
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
            href: getProjectRoute('/sites'),
            title: 'Sites'
        },
        {
            href: getProjectRoute(`/sites/site-${page.params.site}`),
            title: page.params.site
        },
        {
            href: getProjectRoute(`/sites/site-${page.params.site}/deployments`),
            title: 'Deployments'
        },
        {
            href: getProjectRoute(
                `/sites/site-${page.params.site}/deployments/deployment-${page.params.deployment}`
            ),
            title: page.params.deployment
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
