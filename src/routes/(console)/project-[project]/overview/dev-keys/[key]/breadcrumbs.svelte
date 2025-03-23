<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../../store';
    import { devKey } from './store';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization?.$id}`,
            title: $organization?.name
        },
        {
            href: `${base}/project-${$project?.$id}`,
            title: $project?.name
        },
        {
            href: `${base}/project-${$project?.$id}/overview/dev-keys`,
            title: 'Dev keys'
        },
        {
            href: `${base}/project-${$project?.$id}/overview/dev-keys/${$devKey?.$id}`,
            title: $devKey?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
