<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { project } from '../../../store';
    import { database } from '../store';
    import { collection } from './store';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: `${base}/project-${$project?.$id}/databases`,
            title: 'Databases'
        },
        {
            href: `${base}/project-${$project?.$id}/databases/database-${$database?.$id}`,
            title: $database?.name
        },
        {
            href: `${base}/project-${$project?.$id}/databases/database-${$database?.$id}/collection-${$collection?.$id}`,
            title: $collection?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
