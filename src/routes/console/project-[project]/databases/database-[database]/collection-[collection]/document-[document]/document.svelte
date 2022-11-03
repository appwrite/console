<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { CardGrid, Heading } from '$lib/components';
    import { collection } from '../store';
    import { doc } from './store';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { writable } from 'svelte/store';
    import type { Models } from '@aw-labs/appwrite-console';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import Attribute from './attribute.svelte';

    let disableUpdate = true;
    let currentDoc: string;
    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;
    const documentId = $page.params.document;
    const work = writable(
        Object.keys($doc)
            .filter(
                (key) =>
                    ![
                        '$id',
                        '$collection',
                        '$collectionId',
                        '$databaseId',
                        '$createdAt',
                        '$updatedAt'
                    ].includes(key)
            )
            .reduce((obj, key) => {
                obj[key] = $doc[key];
                return obj;
            }, {}) as Models.Document
    );

    onMount(async () => {
        currentDoc = JSON.stringify($work);
    });

    $: if (currentDoc && $work) {
        if (currentDoc !== JSON.stringify($work)) {
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
                $work,
                $work.$permissions
            );

            currentDoc = JSON.stringify($work);
            invalidate(Dependencies.DOCUMENT);
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
    <Heading tag="h6" size="7">Update Data</Heading>
    <p>Update document data based on the attributes created earlier.</p>
    <svelte:fragment slot="aside">
        <form class="form u-grid u-gap-16">
            {#each $collection.attributes.filter((a) => a.status === 'available') as attribute}
                {#if attribute.array}
                    <ul class="form-list">
                        {#each $work[attribute.key] as _v, index}
                            <li class="form-item is-multiple">
                                <div class="form-item-part u-stretch">
                                    <Attribute
                                        {attribute}
                                        id={`${attribute.key}-${index}`}
                                        label={index === 0 ? attribute.key : ''}
                                        bind:value={$work[attribute.key][index]} />
                                </div>
                                <div class="form-item-part u-cross-child-end">
                                    <Button
                                        text
                                        disabled={index === 0}
                                        on:click={() => console.log('remove')}>
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
                                        bind:value={$work[attribute.key][0]} />
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
                        disabled={$work[attribute.key][$work[attribute.key].length - 1] === null}
                        on:click={() => console.log('remove')}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text"> Add item</span>
                    </Button>
                {:else}
                    <ul class="form-list">
                        <Attribute
                            {attribute}
                            id={attribute.key}
                            label={attribute.key}
                            bind:value={$work[attribute.key]} />
                    </ul>
                {/if}
            {/each}
        </form>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button disabled={disableUpdate} on:click={() => updateData()}>Update</Button>
    </svelte:fragment>
</CardGrid>
