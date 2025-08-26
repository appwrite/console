<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { database } from '../store';
    import { collection } from './store';
    import { getProjectRoute } from '$lib/helpers/project';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: getProjectRoute('/databases'),
            title: 'Databases'
        },
        {
            href: getProjectRoute(`/databases/database-${$database?.$id}`),
            title: $database?.name
        },
        {
            href: getProjectRoute(
                `/databases/database-${$database?.$id}/collection-${$collection?.$id}`
            ),
            title: $collection?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
