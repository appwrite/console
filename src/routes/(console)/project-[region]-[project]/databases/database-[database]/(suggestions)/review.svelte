<script lang="ts">
    import { Modal, Confirm } from '$lib/components';
    import { Divider, Icon, Layout } from '@appwrite.io/pink-svelte';
    import { columnOptions } from '../table-[table]/columns/store.js';
    import { Button, InputSelect, InputText } from '$lib/elements/forms';
    import { faker } from '@faker-js/faker';
    import { IconX } from '@appwrite.io/pink-icons-svelte';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import type { SuggestedColumnSchema } from './store';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import type { Columns } from '$routes/(console)/project-[region]-[project]/databases/database-[database]/table-[table]/store';

    let {
        show = $bindable(),
        columns = $bindable()
    }: {
        show: boolean;
        columns: SuggestedColumnSchema[];
    } = $props();

    let draft = $state(columns);
    let confirmDismiss = $state(false);
    let creatingColumns = $state(false);

    const original = structuredClone(columns);
    const canReset = $derived(JSON.stringify(draft) !== JSON.stringify(original));

    const columnTypeOptions = columnOptions
        .filter((col) => col.type !== 'relationship')
        .map((attr) => ({
            label: attr.name,
            leadingIcon: attr.icon,
            value: attr.format || attr.type
        }));

    function removeColumn(key: string) {
        const idx = draft.findIndex((c) => c.key === key);
        if (idx !== -1) {
            draft.splice(idx, 1);
            draft = [...draft];
        }
    }

    function resetDraft() {
        draft = structuredClone(original);
    }

    function getCurrentValue(column: SuggestedColumnSchema): string {
        return column.format || column.type;
    }

    function normalizeColumnType(
        newValue: string,
        column: SuggestedColumnSchema
    ): SuggestedColumnSchema {
        const option = columnOptions.find((opt) => (opt.format || opt.type) === newValue);

        const updated: SuggestedColumnSchema = {
            ...column,
            type: option.type,
            format: option.format || null,
            size: undefined,
            min: undefined,
            max: undefined,
            default: null
        };

        const hadDefault = column.default !== undefined && column.default !== null;
        const canHaveDefault = hadDefault && !column.required;

        switch (option.type) {
            case 'string':
                updated.size = option.format === 'ip' ? 64 : 255;
                if (canHaveDefault) {
                    switch (option.format) {
                        case 'email':
                            updated.default = faker.internet.email();
                            break;
                        case 'ip':
                            updated.default = faker.internet.ip();
                            break;
                        case 'url':
                            updated.default = faker.internet.url();
                            break;
                        default:
                            updated.default = faker.lorem.word();
                            break;
                    }
                }
                break;

            case 'integer':
                updated.min = 0;
                updated.max = 100;
                if (canHaveDefault) {
                    updated.default = faker.number.int({ min: updated.min, max: updated.max });
                }
                break;

            case 'double':
                updated.min = 0;
                updated.max = 100;
                if (canHaveDefault) {
                    updated.default = faker.number.float({
                        min: updated.min,
                        max: updated.max,
                        fractionDigits: 2
                    });
                }
                break;

            case 'boolean':
                if (canHaveDefault) {
                    updated.default = faker.datatype.boolean();
                }
                break;

            case 'datetime':
                if (canHaveDefault) {
                    updated.default = faker.date.recent().toISOString();
                }
                break;

            case 'point':
                if (canHaveDefault) {
                    updated.default = [faker.location.longitude(), faker.location.latitude()];
                }
                break;

            case 'linestring':
                if (canHaveDefault) {
                    updated.default = Array.from({ length: 5 }, () => [
                        faker.location.longitude(),
                        faker.location.latitude()
                    ]);
                }
                break;

            case 'polygon':
                if (canHaveDefault) {
                    const points = Array.from({ length: 5 }, () => [
                        faker.location.longitude(),
                        faker.location.latitude()
                    ]);
                    points.push(points[0]);
                    updated.default = [points];
                }
                break;
        }

        return updated;
    }

    async function createColumns() {
        creatingColumns = true;
        const client = sdk.forProject(page.params.region, page.params.project);

        try {
            const results = [];

            for (const column of draft) {
                const baseParams = {
                    databaseId: page.params.database,
                    tableId: page.params.table,
                    key: column.key,
                    required: column.required || false
                };

                let columnResult: Columns;
                switch (column.type) {
                    case 'string':
                        if (column.format) {
                            switch (column.format) {
                                case 'email':
                                    columnResult =
                                        await client.tablesDB.createEmailColumn(baseParams);
                                    break;
                                case 'ip':
                                    columnResult = await client.tablesDB.createIpColumn(baseParams);
                                    break;
                                case 'url':
                                    columnResult =
                                        await client.tablesDB.createUrlColumn(baseParams);
                                    break;
                                case 'enum':
                                    columnResult = await client.tablesDB.createEnumColumn({
                                        ...baseParams,
                                        elements: []
                                    });
                                    break;
                                default:
                                    columnResult = await client.tablesDB.createStringColumn({
                                        ...baseParams,
                                        size: column.size || 255,
                                        xdefault: (column.default as string) || null
                                    });
                                    break;
                            }
                        } else {
                            columnResult = await client.tablesDB.createStringColumn({
                                ...baseParams,
                                size: column.size || 255,
                                xdefault: (column.default as string) || null
                            });
                        }
                        break;

                    case 'integer':
                        columnResult = await client.tablesDB.createIntegerColumn({
                            ...baseParams,
                            min: column.min,
                            max: column.max,
                            xdefault: (column.default as number) || null
                        });
                        break;

                    case 'double':
                        columnResult = await client.tablesDB.createFloatColumn({
                            ...baseParams,
                            min: column.min,
                            max: column.max,
                            xdefault: (column.default as number) || null
                        });
                        break;

                    case 'boolean':
                        columnResult = await client.tablesDB.createBooleanColumn({
                            ...baseParams,
                            xdefault: (column.default as boolean) || null
                        });
                        break;

                    case 'datetime':
                        columnResult = await client.tablesDB.createDatetimeColumn({
                            ...baseParams,
                            xdefault: (column.default as string) || null
                        });
                        break;

                    case 'point':
                        columnResult = await client.tablesDB.createPointColumn(baseParams);
                        break;

                    case 'linestring':
                        columnResult = await client.tablesDB.createLineColumn(baseParams);
                        break;

                    case 'polygon':
                        columnResult = await client.tablesDB.createPolygonColumn(baseParams);
                        break;
                }

                results.push(columnResult);
            }

            await invalidate(Dependencies.TABLE);

            show = false;
            columns = null;

            addNotification({
                type: 'success',
                message: 'Columns created successfully'
            });

            trackEvent(Submit.ColumnCreate, { type: 'suggestions' });
        } catch (error) {
            trackError(error, Submit.ColumnCreate);
            addNotification({
                type: 'error',
                message: error.message
            });
        } finally {
            creatingColumns = false;
        }
    }
</script>

<Modal bind:show dismissible={false} title="Review columns" onSubmit={createColumns}>
    <svelte:fragment slot="description">
        Review and edit suggested columns before applying
    </svelte:fragment>

    <Layout.Stack direction="column" gap="l">
        {#each draft as column, index (index)}
            <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
                <InputText required id={'name-' + column.key} bind:value={draft[index].key} />

                <InputSelect
                    required
                    id={'type-' + column.key}
                    value={getCurrentValue(draft[index])}
                    options={columnTypeOptions}
                    on:change={(event) => {
                        draft[index] = normalizeColumnType(event.detail, draft[index]);
                        draft = [...draft];
                    }} />

                <Button
                    icon
                    extraCompact
                    on:click={() => removeColumn(column.key)}
                    disabled={draft.length <= 1 || creatingColumns}>
                    <Icon icon={IconX} size="s" />
                </Button>
            </Layout.Stack>

            {#if index !== draft.length - 1}
                <Divider />
            {/if}
        {/each}
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
            <Button text disabled={!canReset || creatingColumns} on:click={resetDraft}
                >Reset</Button>

            <Layout.Stack direction="row" alignItems="flex-end" inline>
                <Button text disabled={creatingColumns} on:click={() => (confirmDismiss = true)}
                    >Dismiss</Button>

                <Button
                    submit
                    submissionLoader
                    forceShowLoader={creatingColumns}
                    disabled={creatingColumns}>Confirm</Button>
            </Layout.Stack>
        </Layout.Stack>
    </svelte:fragment>
</Modal>

<Confirm
    confirmDeletion
    action="Dismiss"
    title="Dismiss columns"
    bind:open={confirmDismiss}
    onSubmit={() => {
        resetDraft();
        show = false;
        columns = null;
    }}>
    Are you sure you want to dismiss these columns suggested by AI? This action is irreversible.
</Confirm>
