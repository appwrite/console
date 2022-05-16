<script lang="ts">
    import { browser } from '$app/env';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Back, Tabs, TabsItem } from '$lib/components';
    import { Cover } from '$lib/layout';
    import { collection } from './store';

    const project = $page.params.project;
    const collectionId = $page.params.collection;

    $: {
        if (browser) {
            collection.load(collectionId);
        }
    }
</script>

<svelte:head>
    <title>Appwrite - {$collection?.name ?? 'Collection'}</title>
</svelte:head>

{#if $collection}
    {#if !$page.url.pathname.startsWith(`/console/${project}/database/collection/${collectionId}/document`)}
        <Cover>
            <svelte:fragment slot="breadcrumbs">
                <Back href={`${base}/console/${project}/database`}>Database</Back>
            </svelte:fragment>
            <svelte:fragment slot="title">{$collection.name}</svelte:fragment>
            <Tabs>
                <TabsItem href={`/console/${project}/database/collection/${collectionId}`}
                    >Documents</TabsItem>
                <TabsItem
                    href={`/console/${project}/database/collection/${collectionId}/attributes`}
                    >Attributes</TabsItem>
                <TabsItem href={`/console/${project}/database/collection/${collectionId}/indexes`}
                    >Indexes</TabsItem>
                <TabsItem href={`/console/${project}/database/collection/${collectionId}/settings`}
                    >Settings</TabsItem>
            </Tabs>
        </Cover>
    {/if}
    <slot />
{:else}
    <div aria-busy="true" />
{/if}
