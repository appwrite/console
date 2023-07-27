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
    import { isRelationship } from '../document-[document]/attributes/store';
    import { indexes, type Attributes } from '../store';
    import { collection } from '../store';
    import Select from './select.svelte';
    import LL from '$i18n/i18n-svelte';

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

    let attributeOptions = $collection.attributes
        .filter((attribute) => !isRelationship(attribute))
        .map((attribute) => ({
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
    <svelte:fragment slot="header">{$LL.console.project.title.createIndex()}</svelte:fragment>
    <FormList>
        <InputText
            id="key"
            label={$LL.console.project.forms.databases.index.inputs.key.label()}
            placeholder={$LL.console.project.forms.databases.index.inputs.key.placeholder()}
            bind:value={key}
            autofocus />
        <InputSelect
            options={types}
            id="type"
            label={$LL.console.project.forms.databases.index.inputs.type.label()}
            bind:value={selectedType} />

        {#each attributeList as attribute, i}
            <li class="form-item is-multiple">
                <div class="form-item-part u-stretch">
                    <Select
                        id={`attribute-${i}`}
                        label={$LL.console.project.forms.databases.index.inputs.attribute.label()}
                        bind:value={attribute.value}>
                        <option value="" disabled hidden
                            >{$LL.console.project.forms.databases.index.options.title.selectAttribute()}</option>

                        <optgroup label="Internal">
                            <option value="$id"
                                >{$LL.console.project.forms.databases.index.options.label.id()}</option>
                            <option value="$createdAt"
                                >{$LL.console.project.forms.databases.index.options.label.createdAt()}</option>
                            <option value="$updatedAt"
                                >{$LL.console.project.forms.databases.index.options.label.updatedAt()}</option>
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
                        <option value="" disabled hidden
                            >{$LL.console.project.forms.databases.index.options.title.selectOrder()}</option>

                        <option value="ASC">
                            {$LL.console.project.forms.databases.index.options.label.asc()}
                        </option>
                        <option value="DESC">
                            {$LL.console.project.forms.databases.index.options.label.desc()}
                        </option>
                    </Select>
                </div>

                <div class="form-item-part u-cross-child-end">
                    <Button
                        noMargin
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
            <span class="text">{$LL.console.project.button.addAttribute()}</span>
        </Button>
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreateIndex = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button submit>{$LL.console.project.button.submit.create()}</Button>
    </svelte:fragment>
</Modal>
