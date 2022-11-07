<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, InputText, FormList, InputSelect } from '$lib/elements/forms';
    import { collection } from '../store';
    import { onMount } from 'svelte';
    import { sdkForProject } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { page } from '$app/stores';
    import type { Attributes } from '../store';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    export let showCreateIndex = false;
    export let externalAttribute: Attributes = null;

    const databaseId = $page.params.database;

    let key: string = null;
    let types = [
        { value: 'key', label: 'Key' },
        { value: 'unique', label: 'Unique' },
        { value: 'fulltext', label: 'FullText' }
    ];
    let newAttr = false;
    let selectedType = '';
    $: attributeOptions = $collection.attributes.map((attribute: Attributes) => ({
        value: attribute.key,
        label: attribute.key
    }));
    $: attributeList = [];

    let selectedAttribute = '';
    let selectedOrder = '';

    onMount(() => {
        if (externalAttribute) {
            attributeList = [{ value: externalAttribute.key, order: 'ASC' }];
        }
    });

    $: if (showCreateIndex) {
        attributeList = [];
        selectedType = selectedOrder = selectedAttribute = '';
        key = null;
    }
    const created = async () => {
        if (selectedAttribute && selectedOrder) {
            attributeList.push({ value: selectedAttribute, order: selectedOrder });
            selectedAttribute = selectedOrder = '';
        }
        try {
            await sdkForProject.databases.createIndex(
                databaseId,
                $collection.$id,
                key,
                selectedType,
                attributeList.map((a) => a.value),
                attributeList.map((a) => a.order)
            );
            invalidate(Dependencies.COLLECTION);
            addNotification({
                message: 'Index has been created',
                type: 'success'
            });
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
        }

        showCreateIndex = false;
    };
</script>

<Modal size="big" on:submit={created} bind:show={showCreateIndex}>
    <svelte:fragment slot="header">Create Index</svelte:fragment>
    <FormList>
        <InputText
            id="key"
            label="Index Key"
            placeholder="Enter Key"
            bind:value={key}
            autofocus
            required />
        <InputSelect
            options={types}
            id="type"
            label="Index type"
            placeholder="Select type"
            bind:value={selectedType}
            required />

        {#if attributeList?.length}
            {#each attributeList as index, i}
                <li class="form-item is-multiple">
                    <div class="form-item-part u-stretch">
                        <label class="label" for="attribute">Attribute</label>
                        <div class="select">
                            <select id="attribute" bind:value={index.value}>
                                <optgroup label="Internal">
                                    <option value="$id">$id</option>
                                    <option value="$createdAt">$createdAt</option>
                                    <option value="$updatedAt">$updatedAt</option>
                                </optgroup>
                                <optgroup label="Attributes">
                                    {#each attributeOptions as option}
                                        <option
                                            value={option.value}
                                            selected={option.value === selectedAttribute}>
                                            {option.label}
                                        </option>
                                    {/each}
                                </optgroup>
                            </select>
                            <span class="icon-cheveron-down" aria-hidden="true" />
                        </div>
                    </div>
                    <div class="form-item-part u-stretch">
                        <label class="label" for="order">Order</label>
                        <div class="select">
                            <select id="order" bind:value={index.order}>
                                <option value="ASC"> ASC </option>
                                <option value="DESC"> DESC </option>
                            </select>
                            <span class="icon-cheveron-down" aria-hidden="true" />
                        </div>
                    </div>

                    <div class="form-item-part u-cross-child-end">
                        <Button
                            text
                            disabled={externalAttribute && i === 0}
                            on:click={() => {
                                if (i === 0) attributeList = [];
                                attributeList = attributeList.splice(i, 1);
                            }}>
                            <span class="icon-x" aria-hidden="true" />
                        </Button>
                    </div>
                </li>
            {/each}
        {/if}
        {#if !attributeList?.length || newAttr}
            <li class="form-item is-multiple">
                <div class="form-item-part u-stretch">
                    <label class="label" for="attribute">Attribute</label>
                    <div class="select">
                        <select required id="attribute" bind:value={selectedAttribute}>
                            <option value="" disabled selected hidden>Select Attribute</option>

                            <optgroup label="Internal">
                                <option value="$id">$id</option>
                                <option value="$createdAt">$createdAt</option>
                                <option value="$updatedAt">$updatedAt</option>
                            </optgroup>
                            <optgroup label="Attributes">
                                {#each attributeOptions as option}
                                    <option
                                        value={option.value}
                                        selected={option.value === selectedAttribute}>
                                        {option.label}
                                    </option>
                                {/each}
                            </optgroup>
                        </select>
                        <span class="icon-cheveron-down" aria-hidden="true" />
                    </div>
                </div>
                <div class="form-item-part u-stretch">
                    <label class="label" for="order">Order</label>
                    <div class="select">
                        <select id="order" bind:value={selectedOrder}>
                            <option value="" disabled selected hidden>Select Order</option>

                            <option value="ASC"> ASC </option>
                            <option value="DESC"> DESC </option>
                        </select>
                        <span class="icon-cheveron-down" aria-hidden="true" />
                    </div>
                </div>

                <div class="form-item-part u-cross-child-end">
                    <Button
                        text
                        disabled={false}
                        on:click={() => {
                            newAttr = false;
                            selectedAttribute = selectedOrder = '';
                        }}>
                        <span class="icon-x" aria-hidden="true" />
                    </Button>
                </div>
            </li>
        {/if}
        <Button
            text
            on:click={() => {
                newAttr = true;
                if (selectedAttribute && selectedOrder) {
                    attributeList.push({ value: selectedAttribute, order: selectedOrder });
                    selectedAttribute = selectedOrder = '';
                }
            }}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text"> Add attribute </span>
        </Button>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreateIndex = false)}>Cancel</Button>
        <Button submit>Create</Button>
    </svelte:fragment>
</Modal>
