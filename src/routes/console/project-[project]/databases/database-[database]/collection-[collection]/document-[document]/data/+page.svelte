<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { CardGrid, Heading } from '$lib/components';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { writable } from 'svelte/store';
    import type { Models } from '@aw-labs/appwrite-console';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { doc } from '../store';
    import { collection } from '../../store';
    import { Container } from '$lib/layout';
    import AttributeItem from '../attributeItem.svelte';

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
            }, {}) as Models.Document
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
            trackEvent(Submit.DocumentUpdate);
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
            trackError(error, Submit.DocumentUpdate);
        }
    }
</script>

<svelte:head>
    <title>Data - Appwrite</title>
</svelte:head>

<Container>
    {#if $collection?.attributes?.length}
        {#each $collection.attributes as attribute}
            {@const label = attribute.key}
            <CardGrid>
                <Heading tag="h6" size="7">{label}</Heading>
                <svelte:fragment slot="aside">
                    <AttributeItem {attribute} bind:formValues={$work} {label} />
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button disabled={disableUpdate} on:click={() => updateData()}>Update</Button>
                </svelte:fragment>
            </CardGrid>
        {/each}
    {/if}
</Container>
