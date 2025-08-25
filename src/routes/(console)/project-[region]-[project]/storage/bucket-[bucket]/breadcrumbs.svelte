<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../store';
    import { bucket } from './store';
    import { getProjectRoute } from '$lib/helpers/project';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization?.$id}`,
            title: $organization.name
        },
        {
            href: getProjectRoute(),
            title: $project.name
        },
        {
            href: getProjectRoute('/storage'),
            title: 'Storage'
        },
        {
            href: getProjectRoute(`/storage/bucket-${$bucket?.$id}`),
            title: $bucket?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
