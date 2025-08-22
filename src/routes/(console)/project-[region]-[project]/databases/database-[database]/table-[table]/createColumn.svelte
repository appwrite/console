<script lang="ts">
    import { page } from '$app/state';
    import { type Columns, type ColumnDirection } from './store';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { InputSelect, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { option, columnOptions, type Option } from './columns/store';
    import type { Column } from '$lib/helpers/types';
    import { preferences } from '$lib/stores/preferences';
    import { onMount } from 'svelte';

    let {
        direction = null,
        column = null,
        columns = $bindable(null),
        columnId = $bindable(null),
        columnsOrder = $bindable(null),
        selectedOption = $bindable('String'),
        onColumnsReorder = null
    }: {
        column?: Columns;
        columnId?: string;
        columns?: Column[];
        columnsOrder?: string[];
        direction: ColumnDirection;
        selectedOption: Option['name'];
        onColumnsReorder?: (newOrder: string[]) => void;
    } = $props();

    const tableId = page.params.table;
    const databaseId = page.params.database;

    let key: string = $state(column?.key ?? null);
    let data: Partial<Columns> = $state({
        required: column?.required ?? false,
        array: column?.array ?? false,
        default: column?.default ?? null,
        ...column
    });

    let ColumnComponent = $derived(
        columnOptions.find((option) => option.name === selectedOption).component
    );

    function init() {
        key = null;
        $option = null;
        data = {
            required: false,
            array: false,
            default: null
        };

        /* default to string */
        selectedOption = 'String';
        $option = columnOptions[0];
    }

    function insertColumnInOrder() {
        if (!key) return;

        const currentOrder = columnsOrder?.length
            ? columnsOrder
            : columns?.map((col) => col.id) || [];

        // if the length is empty,
        // means there's no ordering done.
        // auto handled, leave this here as is.
        if (!currentOrder.length) return;

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
            tableId,
            newOrder
        );

        onColumnsReorder?.(newOrder);
        return newOrder;
    }

    export async function submit() {
        try {
            await $option.create(databaseId, tableId, key, data);

            columnId = key;
            insertColumnInOrder();

            await invalidate(Dependencies.TABLE);

            addNotification({
                type: 'success',
                message: `Column ${key ?? data?.key} has been created`
            });
            trackEvent(Submit.ColumnCreate);
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.ColumnCreate);
        }
    }

    onMount(init);

    $effect(() => {
        columnId; /* silences lint check, variable not read */

        // correct view
        if (selectedOption) {
            $option = columnOptions.find((option) => option.name === selectedOption);
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
            required
            pattern="^[A-Za-z0-9][A-Za-z0-9._\-]*$" />

        <InputSelect
            id="type"
            label="Type"
            bind:value={selectedOption}
            options={columnOptions.map((attr) => {
                return {
                    label: attr.name,
                    value: attr.name,
                    leadingIcon: attr.icon
                };
            })}
            required />
    </Layout.Stack>

    {#if selectedOption}
        <ColumnComponent bind:data onclose={() => ($option = null)} />
    {/if}
</Layout.Stack>
