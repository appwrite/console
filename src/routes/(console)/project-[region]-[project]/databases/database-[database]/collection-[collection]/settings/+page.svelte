<script lang="ts">
    import { page } from '$app/state';
    import { Container } from '$lib/layout';
    import {
        DangerZone,
        UpdateName,
        UpdatePermissions,
        UpdateSecurity,
        UpdateStatus,
        useDatabaseSdk
    } from '$database/(entity)';
    import type { PageProps } from './$types';
    import DisplayName from './displayName.svelte';

    /* served from parent layout */
    const { data }: PageProps = $props();

    const collection = $derived(data.collection);

    const databaseSdk = useDatabaseSdk(page.params.region, page.params.project, data.database.type);

    const entityParams = $derived({
        databaseId: page.params.database,
        entityId: page.params.collection
    });

    async function deleteCollection() {
        await databaseSdk.deleteEntity(entityParams);
    }

    async function updateCollection(
        updates: Partial<{
            name: string;
            enabled: boolean;
            permissions: string[];
            documentSecurity: boolean;
        }>
    ) {
        await databaseSdk.updateEntity({
            ...entityParams,
            name: collection.name,
            ...updates
        });
    }
</script>

<div class="wide-screen-wrapper databases-spreadsheet">
    <Container expanded slotSpacing databasesScreen>
        <UpdateStatus
            entity={collection}
            onChangeStatus={(enabled) => updateCollection({ enabled })} />

        <UpdateName entity={collection} onChangeName={(name) => updateCollection({ name })} />

        <DisplayName />

        <UpdatePermissions
            entity={collection}
            onChangePermissions={(permissions) => updateCollection({ permissions })} />

        <UpdateSecurity
            entity={collection}
            onChangeSecurity={(documentSecurity) => updateCollection({ documentSecurity })} />

        <DangerZone entity={collection} onDelete={deleteCollection} />
    </Container>
</div>
