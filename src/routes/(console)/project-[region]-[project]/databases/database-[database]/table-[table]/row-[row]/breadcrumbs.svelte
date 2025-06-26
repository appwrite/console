<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { database } from '../../store';
    import { table } from '../store';
    import { row } from './store';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}`,
            title: $database?.name
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$table?.$id}`,
            title: $table?.name
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$table?.$id}/row-${$row?.$id}`,
            title: $row?.$id
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
