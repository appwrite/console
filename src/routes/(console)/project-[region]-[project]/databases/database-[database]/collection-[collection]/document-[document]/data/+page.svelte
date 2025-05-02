<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { CardGrid } from '$lib/components';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { writable } from 'svelte/store';
    import type { Models } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { doc } from '../store';
    import { collection, type Attributes } from '../../store';
    import { Container } from '$lib/layout';
    import AttributeItem from '../attributeItem.svelte';
    import { symmetricDifference } from '$lib/helpers/array';
    import { isRelationship, isRelationshipToMany } from '../attributes/store';
    import { deepClone } from '$lib/helpers/object';

    const databaseId = page.params.database;
    const collectionId = page.params.collection;
    const documentId = page.params.document;
    const editing = true;

    function initWork() {
        const prohibitedKeys = [
            '$id',
            '$collection',
            '$collectionId',
            '$databaseId',
            '$createdAt',
            '$updatedAt'
        ];

        const filteredKeys = Object.keys($doc).filter((key) => {
            return !prohibitedKeys.includes(key);
        });

        const result = filteredKeys.reduce((obj, key) => {
            obj[key] = $doc[key];
            return obj;
        }, {});

        return writable(deepClone(result as Models.Document));
    }

    const work = initWork();

    async function updateData() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
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

    function compareAttributes(
        attribute: Attributes,
        $work: Models.Document,
        $doc: Models.Document
    ) {
        if (!attribute) {
            return false;
        }

        const workAttribute = $work?.[attribute.key];
        const docAttribute = $doc?.[attribute.key];

        if (attribute.array) {
            return !symmetricDifference(Array.from(workAttribute), Array.from(docAttribute)).length;
        }

        if (isRelationship(attribute)) {
            if (isRelationshipToMany(attribute as Models.AttributeRelationship)) {
                const workIds = workAttribute.map((doc: string | Record<string, unknown>) =>
                    typeof doc === 'string' ? doc : doc.$id
                );

                const relatedIds = docAttribute.map((doc: string | Record<string, unknown>) =>
                    typeof doc === 'string' ? doc : doc.$id
                );
                return !symmetricDifference(workIds, relatedIds).length;
            } else {
                const workId =
                    typeof workAttribute === 'string' ? workAttribute : workAttribute?.$id;
                const relatedId =
                    typeof docAttribute === 'string' ? docAttribute : docAttribute?.$id;

                return workId === relatedId;
            }
        }
        return workAttribute === docAttribute;
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
                <svelte:fragment slot="title">{label}</svelte:fragment>
                <svelte:fragment slot="aside">
                    <AttributeItem {attribute} bind:formValues={$work} {label} {editing} />
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button
                        disabled={compareAttributes(attribute, $work, $doc)}
                        on:click={() => updateData()}>Update</Button>
                </svelte:fragment>
            </CardGrid>
        {/each}
    {/if}
</Container>
