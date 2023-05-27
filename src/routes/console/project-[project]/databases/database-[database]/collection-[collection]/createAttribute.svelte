<script lang="ts">
    import { Modal } from '$lib/components';
    import { option, options } from './attributes/store';
    import { Button, InputText, FormList, InputSelect } from '$lib/elements/forms';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { page } from '$app/stores';
    import { addNotification } from '$lib/stores/notifications';
    import { base } from '$app/paths';
    import type { Attributes } from './store';
    import { trackEvent } from '$lib/actions/analytics';

    export let showCreate = false;

    let key: string = null;
    let selectedOption = null;
    let data: Partial<Attributes> = {
        required: false,
        array: false,
        default: null
    };
    const databaseId = $page.params.database;
    const collectionId = $page.params.collection;

    async function submit() {
        try {
            await $option.func(databaseId, collectionId, key, data);
            invalidate(Dependencies.COLLECTION);
            if (!$page.url.pathname.includes('attributes')) {
                goto(
                    `${base}/console/project-${$page.params.project}/databases/database-${databaseId}/collection-${collectionId}/attributes`
                );
            }
            addNotification({
                type: 'success',
                message: `Attribute ${key} has been created`
            });
            showCreate = false;
            trackEvent('submit_attribute_create');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
        }
    }

    $: if (selectedOption) {
        $option = options.find((option) => option.name === selectedOption);
    }

    $: if (!showCreate) {
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

<Modal size="big" bind:show={showCreate} on:submit={submit}>
    <svelte:fragment slot="header">Create Attribute</svelte:fragment>
    <FormList>
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
                    Allowed characters: alphanumeric, hyphen, non-leading underscore, period
                </span>
            </div>
        </div>

        <InputSelect
            options={options.map((n) => ({ value: n.name, label: n.name }))}
            id="type"
            label="Attribute type"
            placeholder="Select type"
            bind:value={selectedOption}
            required />
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
