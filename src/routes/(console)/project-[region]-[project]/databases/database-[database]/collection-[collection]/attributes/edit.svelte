<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputText } from '$lib/elements/forms';
    import deepEqual from 'deep-equal';
    import { addNotification } from '$lib/stores/notifications';
    import { type Attributes, databaseColumnSheetOptions } from '../store';
    import { attributeOptions, type Option } from './store';
    import { onMount } from 'svelte';
    import { Layout } from '@appwrite.io/pink-svelte';

    export let isModal = true;
    export let showEdit = false;
    export let selectedAttribute: Attributes;

    let originalKey = '';
    const databaseId = page.params.database;
    const collectionId = page.params.collection;

    let error: string;
    let currentAttr: Attributes;

    onMount(() => {
        if (!isModal) {
            databaseColumnSheetOptions.update((opts) => ({
                ...opts,
                submitAction: () => submit()
            }));
        }
    });

    $: option = attributeOptions.find((option) => {
        if (selectedAttribute) {
            if ('format' in selectedAttribute && selectedAttribute.format) {
                return option?.format === selectedAttribute?.format;
            } else {
                return option?.type === selectedAttribute?.type;
            }
        }
    }) as Option;

    export async function submit() {
        try {
            await option.update(databaseId, collectionId, selectedAttribute, originalKey);
            await invalidate(Dependencies.COLLECTION);

            if (isModal && !page.url.pathname.includes('attributes')) {
                await goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/collection-${collectionId}/attributes`
                );
            }

            addNotification({
                type: 'success',
                message: `Attribute ${selectedAttribute.key} has been updated`
            });

            showEdit = false;
            trackEvent(Submit.AttributeUpdate);

            if (!isModal) {
                invalidate(Dependencies.DOCUMENTS);
                $databaseColumnSheetOptions.show = false;
            }
        } catch (e) {
            error = e.message;
            trackError(e, Submit.AttributeUpdate);
            if (!isModal) {
                addNotification({
                    type: 'error',
                    message: error
                });
            }
        }
    }

    $: onShow(showEdit);
    $: title = `Update ${attributeOptions.find((v) => v.name === option.name)?.sentenceName ?? ''} attribute`;

    function onShow(show: boolean) {
        if (show) {
            currentAttr ??= { ...selectedAttribute };
            originalKey = currentAttr.key;
            error = null;
        } else {
            currentAttr = null;
        }
    }

    $: $databaseColumnSheetOptions.disableSubmit = deepEqual(currentAttr, selectedAttribute);
</script>

{#if isModal}
    <Modal {error} bind:show={showEdit} onSubmit={submit} {title}>
        <svelte:fragment slot="title">
            <div class="u-flex u-cross-center u-gap-8">
                {option?.name}
                {#if option?.type === 'relationship'}
                    <div class="tag eyebrow-heading-3">
                        <span class="text u-x-small">Experimental</span>
                    </div>
                {/if}
            </div>
        </svelte:fragment>

        {#if selectedAttribute}
            {#if selectedAttribute?.type !== 'relationship'}
                <InputText
                    id="key"
                    label="Attribute Key"
                    placeholder="Enter Key"
                    bind:value={selectedAttribute.key}
                    autofocus />
            {/if}
            {#if option}
                <svelte:component
                    this={option.component}
                    editing
                    bind:data={selectedAttribute}
                    onclose={() => (option = null)} />
            {/if}
        {/if}

        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showEdit = false)}>Cancel</Button>
            <Button submit disabled={deepEqual(currentAttr, selectedAttribute)}>Update</Button>
        </svelte:fragment>
    </Modal>
{:else if selectedAttribute}
    <Layout.Stack gap="xxxl">
        <Layout.Stack gap="l">
            {#if selectedAttribute?.type !== 'relationship'}
                <InputText
                    id="key"
                    label="Attribute Key"
                    placeholder="Enter Key"
                    bind:value={selectedAttribute.key}
                    autofocus />
            {/if}
            {#if option}
                <svelte:component
                    this={option.component}
                    editing
                    bind:data={selectedAttribute}
                    onclose={() => (option = null)} />
            {/if}
        </Layout.Stack>
    </Layout.Stack>
{/if}
