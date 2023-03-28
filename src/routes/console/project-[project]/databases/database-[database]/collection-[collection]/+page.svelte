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
    import CreateAttributeDropdown from './attributes/createAttributeDropdown.svelte';

    export let data: PageData;

    let showCreateAttribute = false;
    let showCreateDropdown = false;
    let selectedAttribute: string = null;

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

    $: hasAttributes = !!$collection.attributes.length;

    //Check if $collection.attributes has any attribute without status deleting, stuck or failed
    $: hasValidAttributes = $collection?.attributes?.some((attr) => attr.status === 'available');
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Documents</Heading>
        <div class="u-flex u-gap-16">
            <ViewSelector view={data.view} {columns} hideView isCustomCollection />
            <Button
                disabled={!(hasAttributes && hasValidAttributes)}
                on:click={openWizard}
                event="create_document">
                <span class="icon-plus" aria-hidden="true" />
                <span class="text is-only-desktop">Create document</span>
            </Button>
        </div>
    </div>

    {#if hasAttributes && hasValidAttributes}
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
        <Empty single target="attribute" on:click={() => (showCreateDropdown = true)}>
            <div class="u-text-center">
                <Heading size="7" tag="h2">Create your first attribute to get started.</Heading>
                <p class="body-text-2 u-margin-block-start-4">
                    Need a hand? Check out our documentation.
                </p>
            </div>
            <div class="u-flex u-gap-16 u-main-center">
                <Button
                    external
                    href="https://appwrite.io/docs/databases#attributes"
                    text
                    event="empty_documentation"
                    ariaLabel={`create {target}`}>Documentation</Button>
                <CreateAttributeDropdown
                    bind:showCreateDropdown
                    bind:showCreate={showCreateAttribute}
                    bind:selectedOption={selectedAttribute}>
                    <Button
                        secondary
                        event="create_attribute"
                        on:click={() => {
                            showCreateDropdown = !showCreateDropdown;
                        }}>
                        Create attribute
                    </Button>
                </CreateAttributeDropdown>
            </div>
        </Empty>
    {/if}
</Container>

<CreateAttribute bind:showCreate={showCreateAttribute} selectedOption={selectedAttribute} />
