<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import deepEqual from 'deep-equal';
    import type { Attributes } from '../store';
    import { attributeOptions, type Option } from './store';

    export let showEdit = false;
    export let selectedAttribute: Attributes;

    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;

    let error: string;
    let currentAttr: Attributes;

    $: option = attributeOptions.find((option) => {
        if (selectedAttribute) {
            if ('format' in selectedAttribute && selectedAttribute.format) {
                return option?.format === selectedAttribute?.format;
            } else {
                return option?.type === selectedAttribute?.type;
            }
        }
    }) as Option;

    async function submit() {
        try {
            await option.update(databaseId, collectionId, selectedAttribute);
            await invalidate(Dependencies.COLLECTION);
            if (!$page.url.pathname.includes('attributes')) {
                await goto(
                    `${base}/console/project-${$page.params.project}/databases/database-${databaseId}/collection-${collectionId}/attributes`
                );
            }
            addNotification({
                type: 'success',
                message: `Attribute ${selectedAttribute.key} has been updated`
            });
            showEdit = false;
            trackEvent(Submit.AttributeUpdate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.AttributeUpdate);
        }
    }

    $: if (showEdit) {
        currentAttr ??= { ...selectedAttribute };
        error = null;
    }
</script>

{#if selectedAttribute}
    <Modal {error} size="big" bind:show={showEdit} onSubmit={submit} icon={option?.icon}>
        <svelte:fragment slot="title">
            <div class="u-flex u-cross-center u-gap-8">
                {option?.name}
                {#if option?.type === 'relationship'}
                    <div class="tag eyebrow-heading-3 is-not-mobile">
                        <span class="text u-x-small">Experimental</span>
                    </div>
                {/if}
            </div>
        </svelte:fragment>
        <FormList>
            {#if selectedAttribute?.type !== 'relationship'}
                <InputText
                    id="key"
                    label="Attribute Key"
                    placeholder="Enter Key"
                    bind:value={selectedAttribute.key}
                    autofocus
                    readonly />
            {/if}
            {#if option}
                <svelte:component
                    this={option.component}
                    editing
                    bind:data={selectedAttribute}
                    on:close={() => (option = null)} />
            {/if}
        </FormList>
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showEdit = false)}>Cancel</Button>
            <Button submit disabled={deepEqual(currentAttr, selectedAttribute)}>Update</Button>
        </svelte:fragment>
    </Modal>
{/if}
