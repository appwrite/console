<script lang="ts">
    import { Modal } from '$lib/components';
    import { option, attributeOptions, type Option } from './attributes/store';
    import { Button, InputText, FormList } from '$lib/elements/forms';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { page } from '$app/stores';
    import { addNotification } from '$lib/stores/notifications';
    import { base } from '$app/paths';
    import type { Attributes } from './store';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { preferences } from '$lib/stores/preferences';

    export let showCreate = false;
    export let selectedOption: Option['name'] = null;
    const databaseId = $page.params.database;
    $: collectionId = $page.params.collection;

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

            let selectedColumns = preferences.getCustomCollectionColumns(
                $page.params.project,
                collectionId
            );
            selectedColumns.push(key ?? data?.key);
            preferences.setCustomCollectionColumns(
                $page.params.project,
                $page.route,
                selectedColumns
            );
            await invalidate(Dependencies.COLLECTION);
            if (!$page.url.pathname.includes('attributes')) {
                await goto(
                    `${base}/project-${$page.params.region}-${$page.params.project}/databases/database-${databaseId}/collection-${collectionId}/attributes`
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
</script>

<Modal
    {error}
    size="big"
    bind:show={showCreate}
    onSubmit={submit}
    icon={$option?.icon}
    iconNotMobile={selectedOption === 'Relationship'}>
    <svelte:fragment slot="title">
        {#if selectedOption === 'Relationship'}
            <span class="u-flex u-gap-16 u-cross-center">
                {selectedOption}
                <div class="tag eyebrow-heading-3">
                    <span class="text u-x-small">Experimental</span>
                </div>
            </span>
        {:else}
            {selectedOption}
        {/if}
    </svelte:fragment>
    <FormList>
        {#if selectedOption !== 'Relationship'}
            <div>
                <InputText
                    id="key"
                    label="Attribute Key"
                    placeholder="Enter Key"
                    bind:value={key}
                    autofocus
                    required />

                <div class="u-flex u-gap-4 u-margin-block-start-8 u-small">
                    <span
                        class="icon-info u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
                        aria-hidden="true" />
                    <span class="text u-line-height-1-5">
                        Allowed characters: alphanumeric, hyphen, non-leading underscore, period.
                    </span>
                </div>
            </div>
        {/if}
        {#if selectedOption}
            <svelte:component
                this={$option.component}
                bind:data
                on:close={() => ($option = null)} />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit disabled={!selectedOption}>Create</Button>
    </svelte:fragment>
</Modal>
