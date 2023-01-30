<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { getIfNonNullableObject } from '$lib/helpers/type';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import { collection } from '../store';
    import AttributeForm from './attributeForm.svelte';
    import { doc } from './store';

    let disableUpdate = true;
    let currentDoc: string;
    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;
    const documentId = $page.params.document;

    const work = writable(
        Object.keys($doc)
            .filter((key) => {
                return ![
                    '$id',
                    '$collection',
                    '$collectionId',
                    '$databaseId',
                    '$createdAt',
                    '$updatedAt'
                ].includes(key);
            })
            .reduce((obj, key) => {
                obj[key] = $doc[key];
                return obj;
            }, {} as Models.Document)
    );

    onMount(async () => {
        currentDoc = JSON.stringify($work);
    });

    $: {
        if (currentDoc !== JSON.stringify($work)) {
            disableUpdate = false;
        } else {
            disableUpdate = true;
        }
    }

    async function updateData() {
        const args = getIfNonNullableObject({ databaseId, collectionId, documentId });
        if (!args) return;

        try {
            await sdkForProject.databases.updateDocument(
                args.databaseId,
                args.collectionId,
                args.documentId,
                $work,
                $work.$permissions
            );

            currentDoc = JSON.stringify($work);
            invalidate(Dependencies.DOCUMENT);
            trackEvent('submit_document_update', {
                type: 'android'
            });
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
    }
</script>

<CardGrid>
    <Heading tag="h6" size="7">Update Data</Heading>
    <p>Update document data based on the attributes created earlier.</p>
    <svelte:fragment slot="aside">
        <AttributeForm attributes={$collection.attributes} bind:formValues={$work} gap="16" />
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button disabled={disableUpdate} on:click={() => updateData()}>Update</Button>
    </svelte:fragment>
</CardGrid>
