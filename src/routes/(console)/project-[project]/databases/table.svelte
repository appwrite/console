<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { tooltip } from '$lib/actions/tooltip';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Id, Modal } from '$lib/components';
    import FloatingActionBar from '$lib/components/floatingActionBar.svelte';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellCheck,
        TableCellHead,
        TableCellHeadCheck,
        TableCellText,
        TableHeader,
        TableRowLink,
        TableScroll
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { addNotification } from '$lib/stores/notifications';
    import { canWriteDatabases } from '$lib/stores/roles';
    import { sdk } from '$lib/stores/sdk';
    import type { PageData } from './$types';
    import { columns } from './store';
    import Cell from '$lib/elements/table/cell.svelte';

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

    function getPolicyDescription(cron: string): string {
        const [minute, hour, dayOfMonth, , dayOfWeek] = cron.split(' ');

        if (dayOfMonth !== '*') return 'Monthly';
        if (dayOfWeek !== '*') return 'Weekly on Mondays';
        if (minute !== '*' && hour === '*') return 'Hourly';
        if (hour !== '*') return 'Daily';
    }
</script>

<TableScroll>
    <TableHeader>
        {#if $canWriteDatabases}
            <TableCellHeadCheck
                bind:selected
                pageItemsIds={data.databases.databases.map((c) => c.$id)} />
        {/if}
        {#each $columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.title}</TableCellHead>
            {/if}
        {/each}
    </TableHeader>
    <TableBody>
        {#each data.databases.databases as database}
            <TableRowLink href={`${base}/project-${projectId}/databases/database-${database.$id}`}>
                {#if $canWriteDatabases}
                    <TableCellCheck bind:selectedIds={selected} id={database.$id} />
                {/if}
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
                        {:else if column.id === 'backup'}
                            {@const policies = data.policies?.[database.$id] ?? null}
                            {@const lastBackup = data.lastBackups?.[database.$id] ?? null}
                            {@const description = policies
                                ?.map((policy) => getPolicyDescription(policy.schedule))
                                .join(', ')}

                            <Cell title={column.title} width={column.width}>
                                <span
                                    class="u-trim"
                                    use:tooltip={{
                                        placement: 'bottom',
                                        disabled: !policies || !lastBackup,
                                        content: `Last backup: ${lastBackup}`
                                    }}>
                                    {#if !policies}
                                        <span class="icon-exclamation" /> No backup policies
                                    {:else}
                                        {description}
                                    {/if}
                                </span>
                            </Cell>
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
            <p>
                <span class="is-only-desktop">
                    {selected.length > 1 ? 'databases' : 'database'}
                </span>
                selected
            </p>
        </div>

        <div class="u-flex u-cross-center u-gap-8">
            <Button text on:click={() => (selected = [])}>Cancel</Button>
            <Button secondary on:click={() => (showDelete = true)}>
                <p>Delete</p>
            </Button>
        </div>
    </div>
</FloatingActionBar>

<Modal
    title="Delete Database"
    icon="exclamation"
    state="warning"
    bind:show={showDelete}
    onSubmit={handleDelete}
    headerDivider={false}
    closable={!deleting}>
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
        .indicator {
            border-radius: 0.25rem;
            background: hsl(var(--color-information-100));
            color: hsl(var(--color-neutral-0));

            padding: 0rem 0.375rem;
            display: inline-block;
        }
    }

    .icon-exclamation {
        color: hsl(var(--color-warning-100)) !important;
    }
</style>
