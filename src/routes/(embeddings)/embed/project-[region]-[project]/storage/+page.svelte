<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { Layout } from '@appwrite.io/pink-svelte';
    import View from '$routes/(console)/project-[region]-[project]/storage/view.svelte';
    
    let { data } = $props();

    const createBucketUrl = (bucket: Models.Bucket) => {
        return `${base}/embed/project-${page.params.region}-${page.params.project}/storage/bucket-${bucket.$id}`;
    };
</script>

<Layout.Stack>
    <View
        buckets={data?.buckets || { total: 0, buckets: [] }}
        limit={data?.limit || 25}
        offset={data?.offset || 0}
        view={data?.view || 'grid'}
        search={data?.search || null}
        {createBucketUrl}
    />
</Layout.Stack>