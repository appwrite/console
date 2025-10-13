<script lang="ts">
    import { page } from '$app/state';
    import { sdk } from '$lib/stores/sdk';
    import { Container } from '$lib/layout';
    import {
        DangerZone,
        UpdateName,
        UpdatePermissions,
        UpdateSecurity,
        UpdateStatus
    } from '$database/(entity)';
    import type { PageProps } from './$types';

    /* served from parent layout */
    const { data }: PageProps = $props();

    const collection = $derived(data.collection);

    const params = $derived.by(() => {
        return {
            name: collection.name,
            collectionId: page.params.collection,
            databaseId: page.params.database
        };
    });

    async function deleteCollection() {
        await sdk
            .forProject(page.params.region, page.params.project)
            .documentsDB.deleteCollection({ ...params });
    }

    async function updateCollection(
        updates: Partial<{
            name: string;
            enabled: boolean;
            permissions: string[];
            documentSecurity: boolean;
        }>
    ) {
        await sdk
            .forProject(page.params.region, page.params.project)
            .documentsDB.updateCollection({ ...params, ...updates });
    }
</script>

<div class="wide-screen-wrapper databases-spreadsheet">
    <Container expanded slotSpacing databasesScreen>
        <UpdateStatus
            entity={collection}
            onChangeStatus={(enabled) => updateCollection({ enabled })} />

        <UpdateName entity={collection} onChangeName={(name) => updateCollection({ name })} />

        <UpdatePermissions
            entity={collection}
            onChangePermissions={(permissions) => updateCollection({ permissions })} />

        <UpdateSecurity
            entity={collection}
            onChangeSecurity={(documentSecurity) => updateCollection({ documentSecurity })} />

        <DangerZone entity={collection} onDelete={deleteCollection} />
    </Container>
</div>
