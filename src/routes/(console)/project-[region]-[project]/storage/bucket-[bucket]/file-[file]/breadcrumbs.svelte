<script lang="ts">
    import { base } from '$app/paths';
    import { Breadcrumbs } from '$lib/layout';
    import { project } from '../../../store';
    import { bucket } from '../store';
    import { file } from './store';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: `${base}/project-${$project?.$id}/storage`,
            title: 'Storage'
        },
        {
            href: `${base}/project-${$project?.$id}/storage/bucket-${$bucket?.$id}`,
            title: $bucket?.name
        },
        {
            href: `${base}/project-${$project?.$id}/storage/bucket-${$bucket?.$id}/file-${$file?.$id}`,
            title: $file?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
