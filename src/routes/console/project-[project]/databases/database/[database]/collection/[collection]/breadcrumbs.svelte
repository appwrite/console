<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { project } from '../../../../../store';
    import { database } from '../../store';
    import { collection } from './store';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: `/console/project-${$project.$id}/databases`,
            title: 'Databases'
        },
        {
            href: `/console/project-${$project.$id}/databases/database/${$database.$id}`,
            title: $database.name
        },
        {
            href: `/console/project-${$project.$id}/databases/database/${$database.$id}/collection/${$collection.$id}`,
            title: $collection.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
