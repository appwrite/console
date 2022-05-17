<script lang="ts">
    import { browser } from '$app/env';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Back } from '$lib/components';
    import { Tabs, TabsItem } from '$lib/layout';
    import { Container, Cover } from '$lib/layout';
    import { collection } from '../../store';
    import { doc } from './store';

    const project = $page.params.project;
    const collectionId = $page.params.collection;
    const documentId = $page.params.document;

    $: {
        if (browser) {
            doc.load(collectionId, documentId);
        }
    }
</script>

<svelte:head>
    <title>Appwrite - Database Document</title>
</svelte:head>

{#if $doc && $collection}
    <Cover>
        <Back href={`${base}/console/${project}/database/collection/${collectionId}`}>
            Collection - {$collection.name}
        </Back>
        <h1>{$doc.$id}</h1>
        <Tabs>
            <TabsItem
                href={`/console/${project}/database/collection/${collectionId}/document/${documentId}`}
                >Overview</TabsItem>
            <TabsItem
                href={`/console/${project}/database/collection/${collectionId}/document/${documentId}/activity`}
                >Activity</TabsItem>
        </Tabs>
    </Cover>

    <Container>
        <slot />
    </Container>
{:else}
    <div aria-busy="true" />
{/if}
