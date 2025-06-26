<script lang="ts">
    import { Modal } from '$lib/components';
    import {
        option,
        columnOptions,
        type Option
    } from '$routes/(console)/project-[region]-[project]/databases/database-[database]/table-[table]/columns/store';
    import { Button, InputText } from '$lib/elements/forms';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { page } from '$app/state';
    import { addNotification } from '$lib/stores/notifications';
    import { base } from '$app/paths';
    import type { Columns } from './store';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { preferences } from '$lib/stores/preferences';

    export let showCreate = false;
    export let selectedOption: Option['name'] = null;

    $: tableId = page.params.table;
    const databaseId = page.params.database;

    let key: string = null;
    let data: Partial<Columns> = {
        required: false,
        array: false,
        default: null
    };
    let error: string;

    async function submit() {
        try {
            await $option.create(databaseId, tableId, key, data);

            let selectedColumns = preferences.getCustomTableColumns(tableId);
            selectedColumns.push(key ?? data?.key);
            preferences.setCustomCollectionColumns(selectedColumns);
            await invalidate(Dependencies.TABLE);
            if (!page.url.pathname.includes('columns')) {
                await goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${databaseId}/table-${tableId}/columns`
                );
            }
            addNotification({
                type: 'success',
                message: `Column ${key ?? data?.key} has been created`
            });
            showCreate = false;
            trackEvent(Submit.ColumnCreate);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ColumnCreate);
        }
    }

    $: if (selectedOption) {
        $option = columnOptions.find((option) => option.name === selectedOption);
    }

    $: if (!showCreate) {
        error = null;
        key = null;
        selectedOption = null;
        $option = null;
        data = {
            required: false,
            array: false,
            default: null
        };
    }

    $: title = `Create ${columnOptions.find((option) => option.name === selectedOption)?.sentenceName ?? ''} column`;
</script>

<Modal {error} bind:show={showCreate} onSubmit={submit} {title}>
    {#if selectedOption !== 'Relationship'}
        <InputText
            id="key"
            label="Column key"
            placeholder="Enter key"
            bind:value={key}
            autofocus
            helper="Allowed characters: alphanumeric, hyphen, non-leading underscore, period."
            required />
    {/if}
    {#if selectedOption}
        <svelte:component this={$option.component} bind:data onclose={() => ($option = null)} />
    {/if}
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit disabled={!selectedOption}>Create</Button>
    </svelte:fragment>
</Modal>
