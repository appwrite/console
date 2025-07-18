<script lang="ts">
    import { page } from '$app/state';
    import type { Attributes } from './store';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { InputSelect, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { option, attributeOptions, type Option } from './attributes/store';

    let {
        showCreate = false,
        selectedOption = $bindable('String')
    }: {
        showCreate: boolean;
        selectedOption: Option['name'];
    } = $props();

    const databaseId = page.params.database;
    const collectionId = page.params.collection;

    let key: string = $state(null);
    let data: Partial<Attributes> = $state({
        required: false,
        array: false,
        default: null
    });

    let AttributeComponent = $derived(
        attributeOptions.find((option) => option.name === selectedOption).component
    );

    export async function submit() {
        try {
            await $option.create(databaseId, collectionId, key, data);
            await invalidate(Dependencies.COLLECTION);

            addNotification({
                type: 'success',
                message: `Column ${key ?? data?.key} has been created`
            });
            trackEvent(Submit.AttributeCreate);
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.AttributeCreate);
        }
    }

    $effect(() => {
        // correct view
        if (selectedOption) {
            $option = attributeOptions.find((option) => option.name === selectedOption);
        }

        // cleanup
        if (!showCreate) {
            key = null;
            $option = null;
            selectedOption = null;
            data = {
                required: false,
                array: false,
                default: null
            };
        }
    });
</script>

<Layout.Stack gap="xl">
    <Layout.Stack direction="row">
        <InputText
            id="key"
            label="Key"
            placeholder="Enter key"
            bind:value={key}
            autofocus
            disabled={selectedOption === 'Relationship'}
            required />

        <InputSelect
            id="type"
            label="Type"
            bind:value={selectedOption}
            options={attributeOptions.map((attr) => {
                return {
                    label: attr.name,
                    value: attr.name,
                    leadingIcon: attr.icon
                };
            })}
            required />
    </Layout.Stack>

    {#if selectedOption}
        <AttributeComponent bind:data onclose={() => ($option = null)} />
    {/if}
</Layout.Stack>
