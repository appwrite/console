<script lang="ts">
    import { page } from '$app/stores';
    import { InputSelectSearch } from '$lib/elements/forms';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { teamPrefs } from '$lib/stores/team';
    import { Query, type Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';

    export let id: string;
    export let label: string;
    export let value: string;
    export let attribute: Models.AttributeRelationship;
    export let optionalText: string | undefined = undefined;

    const databaseId = $page.params.database;

    let documentList: Models.DocumentList<Models.Document>;
    let search: string = null;
    let displayNames = ['$id'];

    onMount(async () => {
        teamPrefs.load($organization.$id);
        documentList = await getDocuments();

        displayNames = $teamPrefs?.displayNames?.[attribute?.relatedCollection] ?? ['$id'];
        if (!displayNames?.includes('$id')) {
            displayNames.unshift('$id');
        }
    });

    async function getDocuments(search: string = null) {
        if (search) {
            const documents = await sdk.forProject.databases.listDocuments(
                databaseId,
                attribute.relatedCollection,
                [Query.search(displayNames[0], search), Query.orderDesc('$createdAt')]
            );
            return documents;
        } else {
            const documents = await sdk.forProject.databases.listDocuments(
                databaseId,
                attribute.relatedCollection
            );
            return documents;
        }
    }
    // Reactive statements
    $: getDocuments(search).then((res) => (documentList = res));
</script>

<InputSelectSearch
    {id}
    {label}
    {optionalText}
    required={attribute.required}
    name="documents"
    placeholder={`Select ${attribute.key}`}
    bind:search
    bind:value
    options={documentList?.documents?.map((n) => ({
        value: n.$id,
        label: n?.[displayNames[0]]
    })) ?? []} />
