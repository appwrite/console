<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Wizard } from '$lib/layout';
    import { Alert, Fieldset, Layout, Typography } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import Form from '$lib/elements/forms/form.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { goto } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { writable } from 'svelte/store';
    import ColumnForm from '../row-[row]/columnForm.svelte';
    import { Permissions } from '$lib/components/permissions';
    import type { PageData } from './$types';
    import type { Columns } from '../store';
    import { ID } from '@appwrite.io/console';

    export let data: PageData;

    let showExitModal = false;
    let formComponent: Form;
    let isSubmitting = writable(false);

    type CreateDocument = {
        id?: string;
        row: object;
        permissions: string[];
        columns: Columns[];
    };

    function createRowWritable() {
        const availableColumns = (data.table.columns as unknown as Columns[]).filter(
            (a) => a.status === 'available'
        );
        const initial = {
            id: null,
            row: availableColumns.reduce((acc, attr) => {
                acc[attr.key] = attr.array ? [] : null;

                return acc;
            }, {}),
            permissions: [],
            columns: availableColumns
        };

        return writable<CreateDocument>({ ...initial });
    }

    const createRow = createRowWritable();

    async function create() {
        try {
            const { $id } = await sdk
                .forProject(page.params.region, page.params.project)
                .tables.createRow(
                    page.params.database,
                    page.params.table,
                    $createRow.id ?? ID.unique(),
                    $createRow.row,
                    $createRow.permissions
                );

            addNotification({
                message: 'Row has been created',
                type: 'success'
            });
            trackEvent(Submit.RowCreate, {
                customId: !!$createRow.id // todo: @itznotabug - change store name
            });
            goto(
                `${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/table-${page.params.table}/row-${$id}`
            );
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.RowCreate);
        }
    }
</script>

<Wizard
    title="Create row"
    href={`${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/table-${page.params.table}`}
    bind:showExitModal
    column
    columnSize="s"
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Data">
                <ColumnForm
                    bind:formValues={$createRow.row}
                    columns={$createRow.columns}
                    bind:customId={$createRow.id} />
            </Fieldset>

            <Fieldset legend="Permissions">
                <Layout.Stack gap="xl">
                    <Typography.Text>
                        Choose which permission scopes to grant your application. It is best
                        practice to allow only the permissions you need to meet your project goals.
                    </Typography.Text>
                    {#if data.table.rowSecurity}
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
            </Fieldset>
        </Layout.Stack>
    </Form>

    <svelte:fragment slot="footer">
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Create
        </Button>
    </svelte:fragment>
</Wizard>
