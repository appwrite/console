<script lang="ts">
    import { Container } from '$lib/layout';
    import { symmetricDifference } from '$lib/helpers/array';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import { CardGrid } from '$lib/components';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { writable } from 'svelte/store';
    import type { Models } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { collection, type Attributes } from '../store';
    import AttributeItem from './attributeItem.svelte';
    import { isRelationship, isRelationshipToMany } from './attributes/store';
    import { deepClone } from '$lib/helpers/object';

    export let data;

    const document = data.document;
    const databaseId = page.params.database;
    const documentId = page.params.document;
    const collectionId = page.params.collection;

    function initWork() {
        const prohibitedKeys = [
            '$id',
            '$collection',
            '$collectionId',
            '$databaseId',
            '$createdAt',
            '$updatedAt'
        ];

        const filteredKeys = Object.keys(document).filter((key) => {
            return !prohibitedKeys.includes(key);
        });

        const result = filteredKeys.reduce((obj, key) => {
            obj[key] = document[key];
            return obj;
        }, {});

        return writable(deepClone(result as Models.Document));
    }

    const work = initWork();

    async function updateData() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .databases.updateDocument(
                    databaseId,
                    collectionId,
                    documentId,
                    $work,
                    $work.$permissions
                );

            invalidate(Dependencies.DOCUMENT);
            trackEvent(Submit.DocumentUpdate);
            addNotification({
                message: 'Document has been updated',
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

    function compareAttributes(attr: Attributes, related: Models.Document, doc: Models.Document) {
        if (!attr) {
            return false;
        }

        const documentAttribute = doc?.[attr.key];
        const relatedAttribute = related?.[attr.key];

        // undefined for a second, not sure why!
        if (documentAttribute === undefined || relatedAttribute === undefined) {
            return false;
        }

        if (attr.array) {
            return !symmetricDifference(Array.from(relatedAttribute), Array.from(documentAttribute))
                .length;
        }

        if (isRelationship(attr)) {
            if (isRelationshipToMany(attr as Models.AttributeRelationship)) {
                const workIds = relatedAttribute.map((doc: string | Record<string, unknown>) =>
                    typeof doc === 'string' ? doc : doc.$id
                );

                const relatedIds = documentAttribute.map((doc: string | Record<string, unknown>) =>
                    typeof doc === 'string' ? doc : doc.$id
                );
                return !symmetricDifference(workIds, relatedIds).length;
            } else {
                const workId =
                    typeof relatedAttribute === 'string' ? relatedAttribute : relatedAttribute?.$id;
                const relatedId =
                    typeof documentAttribute === 'string'
                        ? documentAttribute
                        : documentAttribute?.$id;

                return workId === relatedId;
            }
        }
        return relatedAttribute === documentAttribute;
    }
</script>

<svelte:head>
    <title>Data - Appwrite</title>
</svelte:head>

<Container>
    {#if $collection?.attributes?.length}
        {#each $collection.attributes as attribute (attribute.key)}
            {@const label = attribute.key}
            <CardGrid>
                <svelte:fragment slot="title">{label}</svelte:fragment>

                <svelte:fragment slot="aside">
                    <AttributeItem {attribute} bind:formValues={$work} {label} editing />
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button
                        disabled={compareAttributes(attribute, $work, document)}
                        on:click={() => updateData()}>Update</Button>
                </svelte:fragment>
            </CardGrid>
        {/each}
    {/if}
</Container>
