<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { database } from '../store';
    import { table } from './store';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/databases`,
            title: 'Databases'
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}`,
            title: $database?.name
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/table-${$table?.$id}`,
            title: $table?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
