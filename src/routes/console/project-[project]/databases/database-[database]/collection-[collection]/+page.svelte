<script lang="ts">
    import { Empty, Heading, ViewSelector, PaginationWithLimit } from '$lib/components';
    import { Container } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { wizard } from '$lib/stores/wizard';
    import Create from './createDocument.svelte';
    import type { PageData } from './$types';
    import { collection, columns } from './store';
    import CreateAttribute from './createAttribute.svelte';
    import Table from './table.svelte';
    import { preferences } from '$lib/stores/preferences';
    import { page } from '$app/stores';

    export let data: PageData;

    let showCreateAttribute = false;

    $: selected = preferences.getCustomCollectionColumns($page.params.collection);
    $: columns.set(
        $collection.attributes.map((attribute) => ({
            id: attribute.key,
            title: attribute.key,
            type: attribute.type,
            show: selected?.includes(attribute.key) ?? true
        }))
    );

    function openWizard() {
        wizard.start(Create);
    }
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Documents</Heading>
        <div class="u-flex u-gap-16">
            <ViewSelector view={data.view} {columns} hideView isCustomCollection />
            <Button
                disabled={!$collection?.attributes?.length}
                on:click={openWizard}
                event="create_document">
                <span class="icon-plus" aria-hidden="true" />
                <span class="text  is-only-desktop">Create document</span>
            </Button>
        </div>
    </div>

    {#if $collection?.attributes?.length}
        {#if data.documents.total}
            <Table {data} />

            <PaginationWithLimit
                name="Documents"
                limit={data.limit}
                offset={data.offset}
                total={data.documents.total} />
        {:else}
            <Empty
                single
                href="https://appwrite.io/docs/databases#create-documents"
                target="document"
                on:click={openWizard} />
        {/if}
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/databases#attributes"
            target="attribute"
            on:click={() => (showCreateAttribute = true)} />
    {/if}
</Container>

<CreateAttribute bind:showCreate={showCreateAttribute} />
