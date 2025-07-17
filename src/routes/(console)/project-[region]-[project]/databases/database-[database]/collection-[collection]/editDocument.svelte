<script lang="ts">
    import { symmetricDifference } from '$lib/helpers/array';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { type Writable, writable } from 'svelte/store';
    import type { Models } from '@appwrite.io/console';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import { collection, type Attributes } from './store';
    import AttributeItem from './document-[document]/attributeItem.svelte';
    import { isRelationship, isRelationshipToMany } from './document-[document]/attributes/store';
    import { deepClone } from '$lib/helpers/object';

    const databaseId = page.params.database;
    const collectionId = page.params.collection;

    let {
        document = $bindable()
    }: {
        document: Models.Document;
    } = $props();

    let work = $state<Writable<Models.Document> | null>(null);

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

    $effect(() => {
        if (document) work = initWork();
    });

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

    export async function update() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .databases.updateDocument(
                    databaseId,
                    collectionId,
                    document.$id,
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

    export function isDisabled(): boolean {
        if (!work || !$collection?.attributes?.length) return true;

        return $collection.attributes.every((attribute) =>
            compareAttributes(attribute, $work, document)
        );
    }
</script>

{#if $collection?.attributes?.length && work}
    {#each $collection.attributes as attribute}
        {@const label = attribute.key}
        <AttributeItem {attribute} bind:formValues={$work} {label} editing />
    {/each}
{/if}
