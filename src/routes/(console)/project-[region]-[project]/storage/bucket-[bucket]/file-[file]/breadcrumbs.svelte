<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Breadcrumbs } from '$lib/layout';
    import { bucket } from '../store';
    import { file } from './store';

    $: breadcrumbs = [
        {
            title: '...'
        },
        {
            href: `${base}/project-${$page.params.region}-${$page.params.project}/storage`,
            title: 'Storage'
        },
        {
            href: `${base}/project-${$page.params.region}-${$page.params.project}/storage/bucket-${$bucket?.$id}`,
            title: $bucket?.name
        },
        {
            href: `${base}/project-${$page.params.region}-${$page.params.project}/storage/bucket-${$bucket?.$id}/file-${$file?.$id}`,
            title: $file?.name
        }
    ];
</script>

<Breadcrumbs {breadcrumbs} />
