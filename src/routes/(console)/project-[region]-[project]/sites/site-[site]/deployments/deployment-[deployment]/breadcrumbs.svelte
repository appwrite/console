<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../../store';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization?.$id}`,
            title: $organization?.name
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}`,
            title: $project?.name
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/sites`,
            title: 'Sites'
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/sites/site-${page.params.site}`,
            title: page.params.site
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/sites/site-${page.params.site}/deployments`,
            title: 'Deployments'
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/sites/site-${page.params.site}/deployments/deployment-${page.params.deployment}`,
            title: page.params.deployment
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
