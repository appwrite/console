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
    import type { Columns } from '../store';
    import { columnOptions, type Option } from './store';

    export let showEdit = false;
    export let selectedColumn: Columns;

    const databaseId = page.params.database;
    const tableId = page.params.table;
    let originalKey = '';

    let error: string;
    let currentColumn: Columns;

    $: option = columnOptions.find((option) => {
        if (selectedColumn) {
            if ('format' in selectedColumn && selectedColumn.format) {
                return option?.format === selectedColumn?.format;
            } else {
                return option?.type === selectedColumn?.type;
            }
        }
    }) as Option;

    async function submit() {
        try {
            await option.update(databaseId, tableId, selectedColumn, originalKey);
            await invalidate(Dependencies.TABLE);
            if (!page.url.pathname.includes('columns')) {
                await goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${tableId}/columns`
                );
            }
            addNotification({
                type: 'success',
                message: `Column ${selectedColumn.key} has been updated`
            });
            showEdit = false;
            trackEvent(Submit.ColumnUpdate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ColumnUpdate);
        }
    }

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
</script>

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
                label="Column Key"
                placeholder="Enter Key"
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
