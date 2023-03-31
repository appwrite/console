<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { CardGrid, Heading } from '$lib/components';
    import { page } from '$app/stores';
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
    import { difference } from '$lib/helpers/array';
    import { isRelationshipToMany } from '../attributes/realtionship';

    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;
    const documentId = $page.params.document;
    const editing = true;

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

    async function updateData() {
        try {
            await sdk.forProject.databases.updateDocument(
                databaseId,
                collectionId,
                documentId,
                $work,
                $work.$permissions
            );

            invalidate(Dependencies.DOCUMENT);
            trackEvent(Submit.DocumentUpdate);
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
            return !difference(Array.from(workAttribute), Array.from(docAttribute)).length;
        }

        if (attribute.type === 'relationship') {
            if (isRelationshipToMany(attribute as Models.AttributeRelationship)) {
                const relatedIds = docAttribute.map((doc) => doc.$id);
                return !difference(workAttribute, relatedIds).length;
            }
            console.log(workAttribute, docAttribute);
            return !difference(Array.from(workAttribute), Array.from(docAttribute)).length;
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
                <Heading tag="h6" size="7">{label}</Heading>
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
