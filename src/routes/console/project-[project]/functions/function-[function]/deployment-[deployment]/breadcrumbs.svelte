<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { project } from '../../../store';
    import { func } from '../store';
    import { deployment } from './store';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: `/console/project-${$project?.$id}/functions`,
            title: 'Functions'
        },
        {
            href: `/console/project-${$project?.$id}/functions/function-${$func?.$id}`,
            title: $func?.name
        },
        {
            href: `/console/project-${$project?.$id}/functions/function-${$func?.$id}/deployment-${$deployment?.$id}`,
            title: 'Deployment'
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
