<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, FormList, InputSelect, InputText } from '$lib/elements/forms';
    import { remove } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { indexes, type Attributes } from '../store';
    import { collection } from '../store';
    import Select from './select.svelte';

    export let showCreateIndex = false;
    export let externalAttribute: Attributes = null;

    const databaseId = $page.params.database;

    let error: string;
    let key = `index_${$indexes.length + 1}`;
    let types = [
        { value: 'key', label: 'Key' },
        { value: 'unique', label: 'Unique' },
        { value: 'fulltext', label: 'FullText' }
    ];
    let selectedType = 'key';

    let attributeOptions = $collection.attributes.map((attribute: Attributes) => ({
        value: attribute.key,
        label: attribute.key
    }));

    let attributeList = [{ value: '', order: '' }];

    function initialize() {
        attributeList = externalAttribute
            ? [{ value: externalAttribute.key, order: 'ASC' }]
            : [{ value: '', order: 'ASC' }];
        selectedType = 'key';
        key = `index_${$indexes.length + 1}`;
    }

    $: if (showCreateIndex) {
        error = null;
        initialize();
    }

    $: addAttributeDisabled = !attributeList.at(-1)?.value || !attributeList.at(-1)?.order;

    async function create() {
        if (!(key && selectedType && !addAttributeDisabled)) {
            error = 'All fields are required';
            return;
        }

        try {
            await sdk.forProject.databases.createIndex(
                databaseId,
                $collection.$id,
                key,
                selectedType,
                attributeList.map((a) => a.value),
                attributeList.map((a) => a.order)
            );
            await Promise.allSettled([
                invalidate(Dependencies.COLLECTION),
                invalidate(Dependencies.DATABASE)
            ]);

            goto(
                `${base}/console/project-${$page.params.project}/databases/database-${databaseId}/collection-${$collection.$id}/indexes`
            );

            addNotification({
                message: 'Index has been created',
                type: 'success'
            });
            trackEvent(Submit.IndexCreate);
            showCreateIndex = false;
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.IndexCreate);
        }
    }

    function addAttribute() {
        if (addAttributeDisabled) return;

        // We assign instead of pushing to trigger Svelte's reactivity
        attributeList = [...attributeList, { value: '', order: '' }];
    }
</script>

<Modal bind:error size="big" onSubmit={create} bind:show={showCreateIndex}>
    <svelte:fragment slot="header">Create Index</svelte:fragment>
    <FormList>
        <InputText id="key" label="Index Key" placeholder="Enter Key" bind:value={key} autofocus />
        <InputSelect options={types} id="type" label="Index type" bind:value={selectedType} />

        {#each attributeList as attribute, i}
            <li class="form-item is-multiple">
                <div class="form-item-part u-stretch">
                    <Select id={`attribute-${i}`} label="Attribute" bind:value={attribute.value}>
                        <option value="" disabled hidden>Select Attribute</option>

                        <optgroup label="Internal">
                            <option value="$id">$id</option>
                            <option value="$createdAt">$createdAt</option>
                            <option value="$updatedAt">$updatedAt</option>
                        </optgroup>
                        <optgroup label="Attributes">
                            {#each attributeOptions as option}
                                <option value={option.value}>
                                    {option.label}
                                </option>
                            {/each}
                        </optgroup>
                    </Select>
                </div>
                <div class="form-item-part u-stretch">
                    <Select id={`order-${i}`} label="Order" bind:value={attribute.order}>
                        <option value="" disabled hidden>Select Order</option>

                        <option value="ASC"> ASC </option>
                        <option value="DESC"> DESC </option>
                    </Select>
                </div>

                <div class="form-item-part u-cross-child-end">
                    <Button
                        text
                        disabled={attributeList.length <= 1}
                        on:click={() => {
                            attributeList = remove(attributeList, i);
                        }}>
                        <span class="icon-x" aria-hidden="true" />
                    </Button>
                </div>
            </li>
        {/each}

        <Button text noMargin on:click={addAttribute} disabled={addAttributeDisabled}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Add attribute</span>
        </Button>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreateIndex = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
