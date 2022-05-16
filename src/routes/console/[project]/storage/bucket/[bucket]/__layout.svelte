<script lang="ts">
    import { browser } from '$app/env';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Back, Tabs, TabsItem } from '$lib/components';
    import { Cover } from '$lib/layout';
    import { bucket } from './store';

    const project = $page.params.project;
    const bucketId = $page.params.bucket;

    $: {
        if (browser) {
            bucket.load(bucketId);
        }
    }
</script>

<svelte:head>
    <title>Appwrite - Bucket</title>
</svelte:head>
{#if $bucket}
    <Cover>
        <svelte:fragment slot="breadcrumbs">
            <Back href={`${base}/console/${project}/storage`}>Storage</Back>
        </svelte:fragment>
        <svelte:fragment slot="title">{$bucket.name}</svelte:fragment>
        <Tabs>
            <TabsItem href={`/console/${project}/storage/bucket/${bucketId}`}>Files</TabsItem>
            <TabsItem href={`/console/${project}/storage/bucket/${bucketId}/usage`}>Usage</TabsItem>
            <TabsItem href={`/console/${project}/storage/bucket/${bucketId}/settings`}
                >Settings</TabsItem>
        </Tabs>
    </Cover>
    <slot />
{/if}
