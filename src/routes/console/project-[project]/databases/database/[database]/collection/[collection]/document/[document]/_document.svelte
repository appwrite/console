<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { CardGrid } from '$lib/components';
    import { collection } from '../../store';
    import { doc } from './store';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import Attribute from './_attribute.svelte';

    let currentDoc: string;
    let disableUpdate = true;

    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;
    const documentId = $page.params.document;

    onMount(async () => {
        await doc.load(databaseId, collectionId, documentId);
        currentDoc = JSON.stringify($doc);
    });

    $: if (currentDoc && $doc) {
        if (currentDoc !== JSON.stringify($doc)) {
            disableUpdate = false;
        } else {
            disableUpdate = true;
        }
    }

    const updateData = async () => {
        try {
            await sdkForProject.databases.updateDocument(
                databaseId,
                collectionId,
                documentId,
                $doc,
                $doc.$permissions
            );

            currentDoc = JSON.stringify($doc);
            disableUpdate = true;
            addNotification({
                message: 'Document was updated!',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }
    };
</script>

<CardGrid>
    <h6 class="heading-level-7">Update Data</h6>
    <p>Update document data based on the attributes created earlier.</p>
    <svelte:fragment slot="aside">
        <form class="form u-grid u-gap-16">
            {#each $collection.attributes.filter((a) => a.status === 'available') as attribute}
                {#if attribute.array}
                    <ul class="form-list">
                        {#each $doc[attribute.key] as _v, index}
                            <li class="form-item is-multiple">
                                <div class="form-item-part u-stretch">
                                    <Attribute
                                        {attribute}
                                        id={`${attribute.key}-${index}`}
                                        label={index === 0 ? attribute.key : ''}
                                        bind:value={$doc[attribute.key][index]} />
                                </div>
                                <div class="form-item-part u-cross-child-end">
                                    <Button
                                        text
                                        disabled={index === 0}
                                        on:click={() => doc.removeAttribute(attribute.key, index)}>
                                        <span class="icon-x" aria-hidden="true" />
                                    </Button>
                                </div>
                            </li>
                        {:else}
                            <li class="form-item is-multiple">
                                <div class="form-item-part u-stretch">
                                    <Attribute
                                        {attribute}
                                        id={`${attribute.key}-0`}
                                        label={attribute.key}
                                        bind:value={$doc[attribute.key][0]} />
                                </div>
                                <div class="form-item-part u-cross-child-end">
                                    <Button text disabled>
                                        <span class="icon-x" aria-hidden="true" />
                                    </Button>
                                </div>
                            </li>
                        {/each}
                    </ul>

                    <Button
                        text
                        disabled={$doc[attribute.key][$doc[attribute.key].length - 1] === null}
                        on:click={() => {
                            doc.addAttribute(attribute.key);
                        }}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text"> Add item</span>
                    </Button>
                {:else}
                    <ul class="form-list">
                        <Attribute
                            {attribute}
                            id={attribute.key}
                            label={attribute.key}
                            bind:value={$doc[attribute.key]} />
                    </ul>
                {/if}
            {/each}
        </form>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button disabled={disableUpdate} on:click={() => updateData()}>Update</Button>
    </svelte:fragment>
</CardGrid>
