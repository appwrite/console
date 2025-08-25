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
    import { type Columns, columnsOrder, databaseColumnSheetOptions } from '../store';
    import { columnOptions, type Option } from './store';
    import { onMount } from 'svelte';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { preferences } from '$lib/stores/preferences';

    export let isModal = true;
    export let showEdit = false;
    export let selectedColumn: Columns;

    let originalKey = '';
    const databaseId = page.params.database;
    const tableId = page.params.table;

    let error: string;
    let currentColumn: Columns;

    onMount(() => {
        if (!isModal) {
            databaseColumnSheetOptions.update((opts) => ({
                ...opts,
                submitAction: () => submit()
            }));
        }
    });

    $: option = columnOptions.find((option) => {
        if (selectedColumn) {
            if ('format' in selectedColumn && selectedColumn.format) {
                return option?.format === selectedColumn?.format;
            } else {
                return option?.type === selectedColumn?.type;
            }
        }
    }) as Option;

    export async function submit() {
        try {
            await option.update(databaseId, tableId, selectedColumn, originalKey);
            await invalidate(Dependencies.TABLE);

            if (isModal && !page.url.pathname.includes('columns')) {
                await goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${tableId}/columns`
                );
            }

            addNotification({
                type: 'success',
                message: `Column ${selectedColumn.key} has been updated`
            });

            showEdit = false;
            const oldKey = originalKey;
            const newKey = selectedColumn.key;

            // TODO: these stores need to be added.
            if (oldKey !== newKey && $columnsOrder.includes(oldKey)) {
                const updatedOrder = $columnsOrder.map((id) => (id === oldKey ? newKey : id));
                columnsOrder.set(updatedOrder);

                await preferences.saveColumnOrder(
                    page.data.organization.$id ?? page.data.project.teamId,
                    page.params.table,
                    updatedOrder
                );
            }

            trackEvent(Submit.ColumnUpdate);

            if (!isModal) {
                invalidate(Dependencies.ROWS);
                $databaseColumnSheetOptions.show = false;
            }
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ColumnUpdate);
            if (!isModal) {
                addNotification({
                    type: 'error',
                    message: error
                });
            }
        }
    }

    // TODO: @itznotabug - runes?
    $: onShow(showEdit);
    $: title = `Update ${columnOptions.find((v) => v.name === option.name)?.sentenceName ?? ''} column`;

    function onShow(show: boolean) {
        if (show) {
            currentColumn ??= { ...selectedColumn };
            originalKey = currentColumn.key;
            error = null;
        } else {
            currentColumn = null;
        }
    }

    $: $databaseColumnSheetOptions.disableSubmit = deepEqual(currentColumn, selectedColumn);
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

        {#if selectedColumn}
            {#if selectedColumn?.type !== 'relationship'}
                <InputText
                    id="key"
                    label="Column key"
                    placeholder="Enter key"
                    bind:value={selectedColumn.key}
                    autofocus />
            {/if}
            {#if option}
                <svelte:component
                    this={option.component}
                    editing
                    bind:data={selectedColumn}
                    onclose={() => (option = null)} />
            {/if}
        {/if}

        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showEdit = false)}>Cancel</Button>
            <Button submit disabled={deepEqual(currentColumn, selectedColumn)}>Update</Button>
        </svelte:fragment>
    </Modal>
{:else if selectedColumn}
    <Layout.Stack gap="xxxl">
        <Layout.Stack gap="l">
            {#if selectedColumn?.type !== 'relationship'}
                <InputText
                    id="key"
                    label="Column key"
                    placeholder="Enter key"
                    bind:value={selectedColumn.key}
                    autofocus />
            {/if}
            {#if option}
                <svelte:component
                    this={option.component}
                    editing
                    bind:data={selectedColumn}
                    onclose={() => (option = null)} />
            {/if}
        </Layout.Stack>
    </Layout.Stack>
{/if}
