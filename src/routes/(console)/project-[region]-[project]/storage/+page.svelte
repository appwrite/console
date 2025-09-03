<script lang="ts" context="module">
    export let showCreateBucket = writable(false);
</script>

<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { Container } from '$lib/layout';
    import View from './view.svelte';
    import { writable } from 'svelte/store';
    export let data;

    const createBucketUrl = (bucket: Models.Bucket) => {
        return `${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${bucket.$id}`;
    };
</script>

<Container>
    <View
        buckets={data.buckets}
        limit={data.limit}
        offset={data.offset}
        view={data.view}
        search={data.search}
        {createBucketUrl} />
</Container>
