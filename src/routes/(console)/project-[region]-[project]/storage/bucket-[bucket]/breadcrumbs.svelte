<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
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
            href: `${base}/project-${page.params.region}-${page.params.project}`,
            title: $project.name
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/storage`,
            title: 'Storage'
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${$bucket?.$id}`,
            title: $bucket?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
