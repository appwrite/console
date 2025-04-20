<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { project } from '../../../../store';
    import { database } from '../../store';
    import { collection } from '../store';
    import { doc } from './store';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: `${base}/project-${$project?.$id}/databases/database-${$database?.$id}`,
            title: $database?.name
        },
        {
            href: `${base}/project-${$project?.$id}/databases/database-${$database?.$id}/collection-${$collection?.$id}`,
            title: $collection?.name
        },
        {
            href: `${base}/project-${$project?.$id}/databases/database-${$database?.$id}/collection-${$collection?.$id}/document-${$doc?.$id}`,
            title: $doc?.$id
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
