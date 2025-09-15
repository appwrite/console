<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import Container from '$lib/layout/container.svelte';
    import View from '$routes/(console)/project-[region]-[project]/storage/view.svelte';

    let { data } = $props();

    const createBucketUrl = (bucket: Models.Bucket) => {
        return `${base}/embed/project-${page.params.region}-${page.params.project}/storage/bucket-${bucket.$id}`;
    };
</script>

<Container>
    <View
        buckets={data?.buckets || { total: 0, buckets: [] }}
        limit={data?.limit || 25}
        offset={data?.offset || 0}
        view={data?.view || 'grid'}
        search={data?.search || null}
        {createBucketUrl} />
</Container>
