<script lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';

    import { writable } from 'svelte/store';
    import ColumnForm from './row-[row]/columnForm.svelte';
    import { Permissions } from '$lib/components/permissions';
    import type { Columns } from './store';
    import { ID, type Models } from '@appwrite.io/console';
    import { Alert, Layout, Typography, Selector } from '@appwrite.io/pink-svelte';
    import SideSheet from './layout/sidesheet.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { tick } from 'svelte';

    let {
        table,
        showSheet = $bindable(false),
        existingData = $bindable(null)
    }: {
        showSheet: boolean;
        table: Models.Table;
        existingData: Models.Document | null;
    } = $props();

    let isSubmitting = $state(false);
    let columnFormWrapper: HTMLDivElement | null = $state(null);
    let createMore = $state(false);

    type CreateRow = {
        id?: string;
        row: object;
        permissions: string[];
        columns: Columns[];
    };

    function computeInitialCreateRow(): CreateRow {
        const availableColumns = table.columns.filter((a) => a.status === 'available');

        return {
            id: null,
            row: availableColumns.reduce(
                (acc, attr) => {
                    acc[attr.key] = attr.array ? [] : null;
                    return acc;
                },
                {} as Record<string, unknown>
            ),
            permissions: [],
            columns: availableColumns
        };
    }

    function resetCreateRow(): void {
        createRow.set(computeInitialCreateRow());
    }

    let createRow = writable<CreateRow>(computeInitialCreateRow());

    async function create(): Promise<boolean> {
        isSubmitting = true;

        try {
            await sdk.forProject(page.params.region, page.params.project).grids.createRow({
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
            await invalidate(Dependencies.ROW);

            if (createMore) {
                resetCreateRow();
                existingData = null;
                await tick();
                focusFirstInput();
                return true; // this keep sheet open
            }
            return false; // this wull close sheet
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
        <!-- TODO: add a ID badge-->
        <SideSheet
            spaced
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
                    {#if table.rowSecurity}
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
