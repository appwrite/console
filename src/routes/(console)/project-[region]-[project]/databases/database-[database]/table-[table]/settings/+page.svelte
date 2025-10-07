<script lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { Container } from '$lib/layout';
    import DisplayName from './displayName.svelte';
    import {
        DangerZone,
        UpdateName,
        UpdatePermissions,
        UpdateSecurity,
        UpdateStatus
    } from '$database/(entity)';
    import type { PageData } from './$types';

    const {
        data
    }: {
        data: PageData; /* served from parent layout */
    } = $props();

    const table = $derived(data.table);

    const params = $derived.by(() => {
        return {
            name: table.name,
            tableId: page.params.table,
            databaseId: page.params.database
        };
    });

    async function deleteTable() {
        await sdk
            .forProject(page.params.region, page.params.project)
            .tablesDB.deleteTable({ ...params });
    }

    async function updateTable(
        updates: Partial<{
            name: string;
            enabled: boolean;
            permissions: string[];
            rowSecurity: boolean;
        }>
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .tablesDB.updateTable({ ...params, ...updates });
    }
</script>

<div class="wide-screen-wrapper databases-spreadsheet">
    <Container expanded slotSpacing databasesScreen>
        <UpdateStatus entity={table} onChangeStatus={(enabled) => updateTable({ enabled })} />

        <UpdateName entity={table} onChangeName={(name) => updateTable({ name })} />

        <DisplayName />

        <UpdatePermissions
            entity={table}
            onChangePermissions={(permissions) => updateTable({ permissions })} />

        <UpdateSecurity
            entity={table}
            onChangeSecurity={(rowSecurity) => updateTable({ rowSecurity })} />

        <DangerZone entity={table} onDelete={deleteTable} />
    </Container>
</div>
