<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { CardContainer, GridItem1, Id } from '$lib/components';
    import type { PageData } from './$types';

    export let data: PageData;
    const project = $page.params.project;
</script>

<CardContainer total={data.buckets.total} event="bucket">
    {#each data.buckets.buckets as bucket}
        <GridItem1 href={`${base}/console/project-${project}/storage/bucket-${bucket.$id}`}>
            <svelte:fragment slot="title">{bucket.name}</svelte:fragment>
            <Id value={bucket.$id}>{bucket.$id}</Id>
        </GridItem1>
    {/each}
    <svelte:fragment slot="empty">
        <p>Create a new bucket</p>
    </svelte:fragment>
</CardContainer>
