<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { project } from '../../../store';
    import { func } from '../store';
    import { deployment } from './store';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: `${base}/project-${$project?.$id}/functions`,
            title: 'Functions'
        },
        {
            href: `${base}/project-${$project?.$id}/functions/function-${$func?.$id}`,
            title: $func?.name
        },
        {
            href: `${base}/project-${$project?.$id}/functions/function-${$func?.$id}/deployment-${$deployment?.$id}`,
            title: 'Deployment'
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
