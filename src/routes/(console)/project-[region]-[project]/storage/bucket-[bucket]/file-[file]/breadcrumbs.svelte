<script lang="ts">
    import { file } from './store';
    import { bucket } from '../store';
    import { Breadcrumbs } from '$lib/layout';
    import { getProjectRoute } from '$lib/helpers/project';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: getProjectRoute('/storage'),
            title: 'Storage'
        },
        {
            href: getProjectRoute(`/storage/bucket-${$bucket?.$id}`),
            title: $bucket?.name
        },
        {
            href: getProjectRoute(`/storage/bucket-${$bucket?.$id}/file-${$file?.$id}`),
            title: $file?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
