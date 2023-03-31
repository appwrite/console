<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, FormList, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import type { Attributes } from '../store';
    import { options, type Option } from './store';

    export let showEdit = false;
    export let selectedAttribute: Attributes;

    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;

    let updateButtonDisabled = true;
    let error: string;
    let currentAttr: string;

    $: option = options.find((option) => option?.type === selectedAttribute?.type) as Option;

    async function submit() {
        try {
            await option.update(databaseId, collectionId, selectedAttribute);
            await Promise.allSettled([invalidate(Dependencies.COLLECTION)]);
            if (!$page.url.pathname.includes('attributes')) {
                await goto(
                    `${base}/console/project-${$page.params.project}/databases/database-${databaseId}/collection-${collectionId}/attributes`
                );
            }
            addNotification({
                type: 'success',
                message: `Attribute ${selectedAttribute.key} has been created`
            });
            showEdit = false;
            trackEvent(Submit.AttributeUpdate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.AttributeUpdate);
        }
    }

    $: if (showEdit) {
        currentAttr ??= JSON.stringify(selectedAttribute);
        error = null;
    }

    $: updateButtonDisabled = (() => {
        console.log(
            JSON.stringify(selectedAttribute),
            currentAttr,
            JSON.stringify(selectedAttribute) === currentAttr
        );
        return JSON.stringify(selectedAttribute) === currentAttr;
    })();
    // $: console.log(updateButtonDisabled, JSON.stringify(selectedAttribute), currentAttr);
</script>

{#if selectedAttribute}
    <Modal {error} size="big" bind:show={showEdit} onSubmit={submit} icon={option?.icon}>
        <svelte:fragment slot="header">
            <div class="u-flex u-cross-center u-gap-8">
                {option?.name}
                {#if option.type === 'relationship'}
                    <div class="tag eyebrow-heading-3">
                        <span class="text u-x-small">Beta</span>
                    </div>
                {/if}
            </div>
        </svelte:fragment>
        <FormList>
            {#if selectedAttribute?.type !== 'relationship'}
                <div>
                    <InputText
                        id="key"
                        label="Attribute Key"
                        placeholder="Enter Key"
                        bind:value={selectedAttribute.key}
                        autofocus
                        required
                        disabled />

                    <div class="u-flex u-gap-4 u-margin-block-start-8 u-small">
                        <span
                            class="icon-info u-cross-center u-margin-block-start-2 u-line-height-1 u-icon-small"
                            aria-hidden="true" />
                        <span class="text u-line-height-1-5">
                            Allowed characters: alphanumeric, hyphen, non-leading underscore, period
                        </span>
                    </div>
                </div>
            {/if}
            <svelte:component
                this={option.component}
                bind:data={selectedAttribute}
                editing
                on:close={() => (option = null)} />
        </FormList>
        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showEdit = false)}>Cancel</Button>
            <Button submit disabled={updateButtonDisabled}>Update</Button>
        </svelte:fragment>
    </Modal>
{/if}
