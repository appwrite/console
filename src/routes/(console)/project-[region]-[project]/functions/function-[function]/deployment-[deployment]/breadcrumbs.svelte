<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { func } from '../store';
    import { deployment } from './store';
    import { getProjectRoute } from '$lib/helpers/project';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: getProjectRoute('/functions'),
            title: 'Functions'
        },
        {
            href: getProjectRoute(`/functions/function-${$func?.$id}`),
            title: $func?.name
        },
        {
            href: getProjectRoute(
                `/functions/function-${$func?.$id}/deployment-${$deployment?.$id}`
            ),
            title: 'Deployment'
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
