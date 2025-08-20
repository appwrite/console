<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { key } from './store';

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
            href: `${base}/project-${page.params.region}-${page.params.project}/overview/api-keys`,
            title: 'API keys'
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/overview/api-keys/${$key?.$id}`,
            title: $key?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
