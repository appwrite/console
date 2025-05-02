<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Breadcrumbs } from '$lib/layout';
    import { database } from '../store';
    import { collection } from './store';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: `${base}/project-${$page.params.region}-${$page.params.project}/databases`,
            title: 'Databases'
        },
        {
            href: `${base}/project-${$page.params.region}-${$page.params.project}/databases/database-${$database?.$id}`,
            title: $database?.name
        },
        {
            href: `${base}/project-${$page.params.region}-${$page.params.project}/databases/database-${$database?.$id}/collection-${$collection?.$id}`,
            title: $collection?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
