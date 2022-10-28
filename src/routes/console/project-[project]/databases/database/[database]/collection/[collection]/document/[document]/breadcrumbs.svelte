<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { project } from '../../../../../../../store';
    import { database } from '../../../../store';
    import { collection } from '../../store';
    import { doc } from './store';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: `/console/project-${$project.$id}/databases/database/${$database.$id}`,
            title: $database.name
        },
        {
            href: `/console/project-${$project.$id}/databases/database/${$database.$id}/collection/${$collection.$id}`,
            title: $collection.name
        },
        {
            href: `/console/project-${$project.$id}/databases/database/${$database.$id}/collection/${$collection.$id}/document/${$doc.$id}`,
            title: $doc.$id
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
