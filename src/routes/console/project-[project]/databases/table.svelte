<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Id, Modal } from '$lib/components';
    import FloatingActionBar from '$lib/components/floatingActionBar.svelte';
    import { Dependencies } from '$lib/constants';
    import Button from '$lib/elements/forms/button.svelte';
    import InputCheckbox from '$lib/elements/forms/inputCheckbox.svelte';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRowLink,
        TableScroll
    } from '$lib/elements/table';
    import { toggle } from '$lib/helpers/array';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { isHTMLInputElement } from '$lib/helpers/types';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { PageData } from './$types';
    import { columns } from './store';

    export let data: PageData;
    const projectId = $page.params.project;

    let selected: string[] = [];
    let showDelete = false;
    let deleting = false;

    async function handleDelete() {
        showDelete = false;

        const promises = selected.map((databaseId) => sdk.forProject.databases.delete(databaseId));
        try {
            await Promise.all(promises);
            trackEvent(Submit.DatabaseDelete);
            addNotification({
                type: 'success',
                message: `${selected.length} database${selected.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.DATABASES);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DatabaseDelete);
        } finally {
            selected = [];
            showDelete = false;
        }
    }
</script>

<TableScroll>
    <TableHeader>
        <TableCellHead width={10}>
            <InputCheckbox
                id="select-all"
                indeterminate={selected.length > 0 && selected.length < data.databases.total}
                value={selected.length === data.databases.total}
                on:click={(e) => {
                    if (!isHTMLInputElement(e.target)) return;
                    selected = e.target.checked
                        ? data.databases.databases.map((database) => database.$id)
                        : [];
                }} />
        </TableCellHead>
        {#each $columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.title}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.databases.databases as database}
            <TableRowLink
                href={`${base}/console/project-${projectId}/databases/database-${database.$id}`}>
                <TableCell>
                    <InputCheckbox
                        id="select-{database.$id}"
                        value={selected.includes(database.$id)}
                        on:click={(e) => {
                            // Prevent the link from being followed
                            e.preventDefault();
                            const el = e.currentTarget;
                            if (!isHTMLInputElement(el)) return;

                            selected = toggle(selected, database.$id);

                            // Hack to make sure the checkbox is checked, independent of the
                            // preventDefault() call above
                            window.setTimeout(() => {
                                el.checked = selected.includes(database.$id);
                            });
                        }} />
                </TableCell>
                {#each $columns as column}
                    {#if column.show}
                        {#if column.id === '$id'}
                            {#key $columns}
                                <TableCell width={column.width} title={column.title}>
                                    <Id value={database.$id}>
                                        {database.$id}
                                    </Id>
                                </TableCell>
                            {/key}
                        {:else if column.id === 'name'}
                            <TableCellText width={column.width} title={column.title}>
                                {database.name}
                            </TableCellText>
                        {:else}
                            <TableCellText width={column.width} title={column.title}>
                                {toLocaleDateTime(database[column.id])}
                            </TableCellText>
                        {/if}
                    {/if}
                {/each}
            </TableRowLink>
        {/each}
    </TableBody>
</TableScroll>

<FloatingActionBar show={selected.length > 0}>
    <div class="u-flex u-cross-center u-main-space-between actions">
        <div class="u-flex u-cross-center u-gap-8">
            <span class="indicator body-text-2 u-bold">{selected.length}</span>
            <span>
                {selected.length > 1 ? 'databases' : 'database'} selected
            </span>
        </div>

        <div class="u-flex u-cross-center u-gap-8">
            <Button text on:click={() => (selected = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>Delete selection</Button>
        </div>
    </div>
</FloatingActionBar>

<Modal
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}
    closable={!deleting}>
    <svelte:fragment slot="header">Delete Database</svelte:fragment>
    <p class="text" data-private>
        Are you sure you want to delete <b>{selected.length}</b>
        {selected.length > 1 ? 'databases' : 'database'}?
    </p>
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)} disabled={deleting}>Cancel</Button>
        <Button secondary submit disabled={deleting}>Delete</Button>
    </svelte:fragment>
</Modal>

<style lang="scss">
    .actions {
        width: 31.25rem;

        .indicator {
            border-radius: 0.25rem;
            background: hsl(var(--color-information-100));
            color: hsl(var(--color-neutral-0));

            padding: 0rem 0.375rem;
            display: inline-block;
        }
    }
</style>
