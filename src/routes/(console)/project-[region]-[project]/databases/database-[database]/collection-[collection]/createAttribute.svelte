<script lang="ts">
    import { Modal } from '$lib/components';
    import { option, attributeOptions, type Option } from './attributes/store';
    import { Button, InputText } from '$lib/elements/forms';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { page } from '$app/state';
    import { addNotification } from '$lib/stores/notifications';
    import type { Attributes } from './store';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { preferences } from '$lib/stores/preferences';
    import { getProjectRoute } from '$lib/helpers/project';

    export let showCreate = false;
    export let selectedOption: Option['name'] = null;
    const databaseId = page.params.database;
    $: collectionId = page.params.collection;

    let key: string = null;
    let data: Partial<Attributes> = {
        required: false,
        array: false,
        default: null
    };
    let error: string;

    async function submit() {
        try {
            await $option.create(databaseId, collectionId, key, data);

            let selectedColumns = preferences.getCustomCollectionColumns(collectionId);
            selectedColumns.push(key ?? data?.key);
            preferences.setCustomCollectionColumns(selectedColumns);
            await invalidate(Dependencies.COLLECTION);
            if (!page.url.pathname.includes('attributes')) {
                await goto(
                    getProjectRoute(
                        `/databases/database-${databaseId}/collection-${collectionId}/attributes`
                    )
                );
            }
            addNotification({
                type: 'success',
                message: `Attribute ${key ?? data?.key} has been created`
            });
            showCreate = false;
            trackEvent(Submit.AttributeCreate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.AttributeCreate);
        }
    }

    $: if (selectedOption) {
        $option = attributeOptions.find((option) => option.name === selectedOption);
    }

    $: if (!showCreate) {
        error = null;
        key = null;
        selectedOption = null;
        $option = null;
        data = {
            required: false,
            array: false,
            default: null
        };
    }

    $: title = `Create ${attributeOptions.find((option) => option.name === selectedOption)?.sentenceName ?? ''} attribute`;
</script>

<Modal {error} bind:show={showCreate} onSubmit={submit} {title}>
    {#if selectedOption !== 'Relationship'}
        <InputText
            id="key"
            label="Attribute key"
            placeholder="Enter key"
            bind:value={key}
            autofocus
            helper="Allowed characters: alphanumeric, hyphen, non-leading underscore, period."
            required />
    {/if}
    {#if selectedOption}
        <svelte:component this={$option.component} bind:data onclose={() => ($option = null)} />
    {/if}
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit disabled={!selectedOption}>Create</Button>
    </svelte:fragment>
</Modal>
