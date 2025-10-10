<script lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';

    import { writable } from 'svelte/store';
    import ColumnForm from './columns/columnForm.svelte';
    import { Permissions } from '$lib/components/permissions';
    import { type Columns, spreadsheetRenderKey } from '../store';
    import { ID, type Models } from '@appwrite.io/console';
    import { Alert, Layout, Typography, Selector } from '@appwrite.io/pink-svelte';
    import { type Entity, type Field, SideSheet, toRelationalField } from '$database/(entity)';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { tick } from 'svelte';
    import { isRelationship, isRelationshipToMany } from './store';
    import { hash } from '$lib/helpers/string';

    type CreateRow = {
        id?: string;
        row: object;
        permissions: string[];
        columns: Columns[];
    };

    let {
        table,
        showSheet = $bindable(false),
        existingData = $bindable(null)
    }: {
        table: Entity;
        showSheet: boolean;
        existingData: Models.Row | null;
    } = $props();

    let createMore = $state(false);
    let isSubmitting = $state(false);
    let columnFormWrapper: HTMLDivElement | null = $state(null);

    let createRow = writable<CreateRow>(computeInitialCreateRow());

    function resetCreateRow(): void {
        createRow.set(computeInitialCreateRow());
    }

    function computeInitialCreateRow(): CreateRow {
        const availableColumns = table.fields
            .filter((field: Field) => field.status === 'available')
            .map(toRelationalField);

        return {
            id: null,
            row: existingData
                ? existingData
                : availableColumns.reduce(
                      (acc, attr) => {
                          acc[attr.key] = attr.array ? [] : null;
                          return acc;
                      },
                      {} as Record<string, unknown>
                  ),
            permissions: existingData?.$permissions ?? [],
            columns: availableColumns
        };
    }

    // for one to *, we need the IDs,
    // for many to *, we need the full row object.
    function prepareRowPayload(createRowObject: CreateRow): object {
        const { row, columns } = createRowObject;

        const payload = structuredClone(row);

        for (const column of columns) {
            if (isRelationship(column) && !isRelationshipToMany(column)) {
                const key = column.key;
                const value = payload[key];

                if (value && typeof value === 'object') {
                    if (Array.isArray(value)) {
                        payload[key] = value.map((item) => item?.$id).filter(Boolean);
                    } else {
                        payload[key] = (value as { $id: string })['$id'];
                    }
                }
            }
        }

        return payload;
    }

    async function create(): Promise<boolean> {
        isSubmitting = true;

        $createRow.row = prepareRowPayload($createRow);

        try {
            const row = await sdk
                .forProject(page.params.region, page.params.project)
                .tablesDB.createRow({
                    databaseId: page.params.database,
                    tableId: page.params.table,
                    rowId: $createRow.id ?? ID.unique(),
                    data: $createRow.row,
                    permissions: $createRow.permissions
                });

            addNotification({
                message: 'Row has been created',
                type: 'success'
            });

            trackEvent(Submit.RowCreate, {
                customId: !!$createRow.id
            });

            await invalidate(Dependencies.ROWS);

            // re-render spreadsheet on addition!
            spreadsheetRenderKey.set(hash(row.$id));

            if (createMore) {
                resetCreateRow();
                existingData = null;
                await tick();
                focusFirstInput();
                return true; // keep sheet open
            }
            return false; // close sheet
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.RowCreate);
            return true; // keep open on error
        } finally {
            isSubmitting = false;
        }
    }

    function focusFirstInput() {
        const firstInput = columnFormWrapper?.querySelector<HTMLInputElement | HTMLTextAreaElement>(
            'input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly])'
        );

        firstInput?.focus({ preventScroll: true });
    }

    $effect(() => {
        if (showSheet) {
            focusFirstInput();
            resetCreateRow();
        } else {
            createMore = false;
        }
    });
</script>

{#if $createRow}
    <div class="sheet-container">
        <SideSheet
            title={`${existingData ? 'Duplicate' : 'Create'} row`}
            bind:show={showSheet}
            closeOnBlur={false}
            submit={{
                text: 'Create',
                disabled: isSubmitting,
                onClick: async () => await create()
            }}>
            {#snippet footer()}
                <Layout.Stack inline direction="row" alignItems="center">
                    <Selector.Switch
                        id="create-more"
                        bind:checked={createMore}
                        label="Create more" />
                </Layout.Stack>
            {/snippet}

            <Layout.Stack gap="xxl">
                <div bind:this={columnFormWrapper}>
                    <ColumnForm
                        columns={$createRow.columns}
                        bind:customId={$createRow.id}
                        bind:formValues={$createRow.row} />
                </div>

                <Layout.Stack gap="xl">
                    <Typography.Text>
                        Choose which permission scopes to grant your application. It is best
                        practice to allow only the permissions you need to meet your project goals.
                    </Typography.Text>
                    {#if table.recordSecurity}
                        <Alert.Inline status="info">
                            <svelte:fragment slot="title">Row security is enabled</svelte:fragment>
                            Users will be able to access this row if they have been granted
                            <b>either row or table permissions</b>.
                        </Alert.Inline>
                        <Permissions bind:permissions={$createRow.permissions} />
                    {:else}
                        <Alert.Inline status="info">
                            <svelte:fragment slot="title">Row security is disabled</svelte:fragment>
                            If you want to assign row permissions, navigate to Table settings and enable
                            row security. Otherwise, only table permissions will be used.
                        </Alert.Inline>
                    {/if}
                </Layout.Stack>
            </Layout.Stack>
        </SideSheet>
    </div>
{/if}
