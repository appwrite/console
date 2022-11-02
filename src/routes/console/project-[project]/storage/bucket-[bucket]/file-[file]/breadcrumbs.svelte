<script lang="ts">
    import { Breadcrumbs } from '$lib/layout';
    import { project } from '../../../store';
    import { bucket } from '../store';
    import { file } from './store';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: `/console/project-${$project?.$id}/storage`,
            title: 'Storage'
        },
        {
            href: `/console/project-${$project?.$id}/storage/bucket-${$bucket?.$id}`,
            title: $bucket?.name
        },
        {
            href: `/console/project-${$project?.$id}/storage/bucket-${$bucket?.$id}/file-${$file?.$id}`,
            title: $file?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
