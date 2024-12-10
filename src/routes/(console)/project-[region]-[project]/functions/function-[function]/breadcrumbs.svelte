<script lang="ts">
    import { base } from '$app/paths';
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
            href: `${base}/project-${$project?.$id}`,
            title: $project?.name
        },
        {
            href: `${base}/project-${$project?.$id}/functions`,
            title: 'Functions'
        },
        {
            href: `${base}/project-${$project?.$id}/functions/function-${$func?.$id}`,
            title: $func?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
