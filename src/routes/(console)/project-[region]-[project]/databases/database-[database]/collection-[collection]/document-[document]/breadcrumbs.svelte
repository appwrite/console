<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Breadcrumbs } from '$lib/layout';
    import { database } from '../../store';
    import { collection } from '../store';
    import { doc } from './store';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}`,
            title: $database?.name
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/collection-${$collection?.$id}`,
            title: $collection?.name
        },
        {
            href: `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/collection-${$collection?.$id}/document-${$doc?.$id}`,
            title: $doc?.$id
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
