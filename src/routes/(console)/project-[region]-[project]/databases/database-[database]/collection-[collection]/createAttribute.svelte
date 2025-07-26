<script lang="ts">
    import { page } from '$app/state';
    import { type Attributes, type ColumnDirection } from './store';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { InputSelect, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { attributeOptions, option, type Option } from './attributes/store';
    import type { Column } from '$lib/helpers/types';
    import { preferences } from '$lib/stores/preferences';

    let {
        direction = null,
        showCreate = false,
        columns = $bindable(null),
        columnId = $bindable(null),
        columnsOrder = $bindable(null),
        selectedOption = $bindable('String'),
        onColumnsReorder = null
    }: {
        showCreate: boolean;
        columnId?: string;
        columns?: Column[];
        columnsOrder?: string[];
        direction: ColumnDirection;
        selectedOption: Option['name'];
        onColumnsReorder?: (newOrder: string[]) => void;
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

    function insertColumnInOrder() {
        if (!key) return;

        const currentOrder = columnsOrder?.length
            ? columnsOrder
            : columns?.map((col) => col.id) || [];

        let newOrder: string[];

        if (!direction || !direction.neighbour) {
            // Find the actions column position
            const actionsIndex = currentOrder.indexOf('actions');
            const beforeActionsOrder =
                actionsIndex !== -1 ? currentOrder.slice(0, actionsIndex) : currentOrder;

            const lastTwo = beforeActionsOrder.slice(-2);
            const hasTimestampColumnsAtEnd =
                lastTwo.length === 2 &&
                lastTwo.includes('$createdAt') &&
                lastTwo.includes('$updatedAt');

            let insertIndex: number;

            if (hasTimestampColumnsAtEnd) {
                insertIndex = Math.min(
                    currentOrder.indexOf('$createdAt'),
                    currentOrder.indexOf('$updatedAt')
                );
            } else {
                // Insert at the end, but before actions
                insertIndex = actionsIndex !== -1 ? actionsIndex : currentOrder.length;
            }

            newOrder = [
                ...currentOrder.slice(0, insertIndex),
                key,
                ...currentOrder.slice(insertIndex)
            ];
        } else {
            const neighbourIndex = currentOrder.indexOf(direction.neighbour);

            if (neighbourIndex === -1) {
                const actionsIndex = currentOrder.indexOf('actions');
                const insertIndex = actionsIndex !== -1 ? actionsIndex : currentOrder.length;

                newOrder = [
                    ...currentOrder.slice(0, insertIndex),
                    key,
                    ...currentOrder.slice(insertIndex)
                ];
            } else {
                const insertIndex = direction.to === 'left' ? neighbourIndex : neighbourIndex + 1;
                newOrder = [
                    ...currentOrder.slice(0, insertIndex),
                    key,
                    ...currentOrder.slice(insertIndex)
                ];
            }
        }

        preferences.saveColumnOrder(
            page.data.organization.$id ?? page.data.project.teamId,
            collectionId,
            newOrder
        );

        onColumnsReorder?.(newOrder);
        return newOrder;
    }

    export async function submit() {
        try {
            await $option.create(databaseId, collectionId, key, data);

            columnId = key;
            insertColumnInOrder();

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
