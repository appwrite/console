<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Breadcrumbs } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
    import { project } from '../../store';
    import { func } from './store';

    $: breadcrumbs = [
        {
            href: `${base}/organization-${$organization?.$id}`,
            title: $organization?.name
        },
        {
            href: `${base}/project-${$page.params.region}-${$page.params.project}`,
            title: $project?.name
        },
        {
            href: `${base}/project-${$page.params.region}-${$page.params.project}/functions`,
            title: 'Functions'
        },
        {
            href: `${base}/project-${$page.params.region}-${$page.params.project}/functions/function-${$func?.$id}`,
            title: $func?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
