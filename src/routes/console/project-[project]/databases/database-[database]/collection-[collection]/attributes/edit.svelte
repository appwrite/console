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

    $: attr = selectedAttribute as {
        type?: string;
        size?: string;
        format?: string;
        array?: boolean;
        required?: boolean;
        status?: string;
        key?: string;
        min?: string;
        max?: string;
        default: string;
        elements?: string[];
    };

    $: option = options.find((option) => option?.type === attr?.type) as Option;

    async function submit() {
        try {
            await option.update(databaseId, collectionId, attr);
            await Promise.allSettled([invalidate(Dependencies.COLLECTION)]);
            if (!$page.url.pathname.includes('attributes')) {
                await goto(
                    `${base}/console/project-${$page.params.project}/databases/database-${databaseId}/collection-${collectionId}/attributes`
                );
            }
            addNotification({
                type: 'success',
                message: `Attribute ${attr.key} has been created`
            });
            showEdit = false;
            trackEvent(Submit.AttributeUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.AttributeUpdate);
        }
    }

    $: if (JSON.stringify(attr) !== JSON.stringify(selectedAttribute)) {
        updateButtonDisabled = false;
    } else updateButtonDisabled = true;
</script>

<Modal size="big" bind:show={showEdit} on:submit={submit} icon={option?.icon}>
    <svelte:fragment slot="header">
        {attr?.type}
        {#if attr?.type === 'Relationship'}
            <div class="tag eyebrow-heading-3">
                <span class="text u-x-small">Beta</span>
            </div>
        {/if}
    </svelte:fragment>
    <FormList>
        {#if selectedAttribute}
            {#if option.name !== 'Relationship'}
                <div>
                    <InputText
                        id="key"
                        label="Attribute Key"
                        placeholder="Enter Key"
                        bind:value={attr.key}
                        autofocus
                        required />

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
                bind:data={attr}
                editing
                on:close={() => (option = null)} />
        {/if}
    </FormList>
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showEdit = false)}>Cancel</Button>
        <Button submit disabled={attr === selectedAttribute}>Update</Button>
    </svelte:fragment>
</Modal>
