<script lang="ts" context="module">
    import { writable } from 'svelte/store';

    const createAttributeArgs = writable({
        showCreate: false,
        selectedOption: null as Option['name'] | null
    });

    export const initCreateAttribute = (option: Option['name']) => {
        createAttributeArgs.set({ showCreate: true, selectedOption: option });
    };

    const showCreateIndex = writable(false);
    export const initCreateIndex = () => {
        showCreateIndex.set(true);
    };
</script>

<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { realtime, sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import {
        collection,
        columns,
        columnsOrder,
        databaseColumnSheetOptions,
        databaseRowSheetOptions,
        randomDataModalState,
        reorderItems,
        showCreateAttributeSheet,
        spreadsheetLoading
    } from './store';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import CreateAttribute from './createAttribute.svelte';
    import type { Option } from './attributes/store';
    import { CreateAttributePanel } from '$lib/commandCenter/panels';
    import { database } from '../store';
    import { project } from '../../../store';
    import { page } from '$app/state';
    import { base } from '$app/paths';
    import { canWriteCollections } from '$lib/stores/roles';
    import { IconEye, IconLockClosed, IconPlus, IconPuzzle } from '@appwrite.io/pink-icons-svelte';
    import SideSheet from './layout/sidesheet.svelte';
    import EditDocument from './editDocument.svelte';
    import EditAttribute from './attributes/edit.svelte';
    import { Dialog, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { Button, Seekbar } from '$lib/elements/forms';
    import { generateFakeDocuments, generateAttributes } from '$lib/helpers/faker';
    import { addNotification } from '$lib/stores/notifications';
    import { sleep } from '$lib/helpers/promises';

    let editDocument: EditDocument;
    let createAttribute: CreateAttribute;
    let selectedOption: Option['name'] = 'String';

    onMount(() => {
        return realtime
            .forProject(page.params.region, page.params.project)
            .subscribe(['project', 'console'], (response) => {
                if (
                    response.events.includes('databases.*.collections.*.attributes.*') ||
                    response.events.includes('databases.*.collections.*.indexes.*')
                ) {
                    invalidate(Dependencies.COLLECTION);
                }
            });
    });

    $: $registerCommands([
        {
            label: 'Create document',
            keys: page.url.pathname.endsWith($collection.$id) ? ['c'] : ['c', 'd'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/collection-${$collection?.$id}/create`
                );
            },
            icon: IconPlus,
            group: 'documents'
        },
        {
            label: 'Create attribute',
            keys: page.url.pathname.endsWith('attributes') ? ['c'] : ['c', 'a'],
            callback() {
                addSubPanel(CreateAttributePanel);
            },
            icon: IconPlus,
            group: 'attributes',
            disabled: !$canWriteCollections
        },
        {
            label: 'Go to documents',
            keys: ['g', 'd'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/collection-${$collection?.$id}`
                );
            },
            disabled: page.url.pathname.endsWith($collection.$id),
            group: 'collections'
        },
        {
            label: 'Go to attributes',
            keys: ['g', 'a'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/collection-${$collection?.$id}/attributes`
                );
            },
            disabled: page.url.pathname.endsWith('attributes'),
            group: 'collections'
        },
        {
            label: 'Go to indexes',
            keys: ['g', 'i'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/collection-${$collection?.$id}/indexes`
                );
            },
            disabled: page.url.pathname.endsWith('indexes'),
            group: 'collections'
        },
        {
            label: 'Go to activity',
            keys: ['g', 'c'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/collection-${$collection?.$id}/activity`
                );
            },
            disabled: page.url.pathname.endsWith('activity'),
            group: 'collections'
        },
        {
            label: 'Go to usage',
            keys: ['g', 'u'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/collection-${$collection?.$id}/usage`
                );
            },
            disabled: page.url.pathname.endsWith('usage'),
            group: 'collections'
        },
        {
            label: 'Go to settings',
            keys: ['g', 's'],
            callback() {
                goto(
                    `${base}/project-${page.params.region}-${page.params.project}/databases/database-${$database?.$id}/collection-${$collection?.$id}/settings`
                );
            },
            disabled: page.url.pathname.endsWith('settings') || !$canWriteCollections,
            group: 'collections'
        },
        {
            label: 'Display Name',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/databases/database-${$database.$id}/collection-${$collection.$id}/settings#display-name`
                );
            },
            group: 'collections',
            disabled:
                page.url.pathname.endsWith('display-name') ||
                page.url.pathname.endsWith('settings') ||
                !$canWriteCollections,
            icon: IconEye
        },
        {
            label: 'Permissions',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/databases/database-${$database.$id}/collection-${$collection.$id}/settings#permissions`
                );
            },
            group: 'collections',
            disabled:
                page.url.pathname.endsWith('permissions') ||
                page.url.pathname.endsWith('settings') ||
                !$canWriteCollections,
            icon: IconPuzzle
        },
        {
            label: 'Document security',
            async callback() {
                await goto(
                    `${base}/project-${$project.region}-${$project.$id}/databases/database-${$database.$id}/collection-${$collection.$id}/settings#document-security`
                );
            },
            group: 'collections',
            disabled:
                page.url.pathname.endsWith('document-security') ||
                page.url.pathname.endsWith('settings') ||
                !$canWriteCollections,
            icon: IconLockClosed
        },
        {
            label: 'Create index',
            keys: page.url.pathname.endsWith('indexes') ? ['c'] : ['c', 'i'],
            callback() {
                initCreateIndex();
            },
            icon: IconPlus,
            group: 'indexes',
            disabled: !$canWriteCollections
        }
    ]);

    $updateCommandGroupRanks({
        attributes: 1000,
        documents: 900,
        collections: 800,
        indexes: 700
    });

    async function createFakeData() {
        $spreadsheetLoading = true;
        $randomDataModalState.show = false;

        let attributes = $collection.attributes;
        if (!attributes.length) {
            try {
                attributes = await generateAttributes(
                    $project,
                    page.params.database,
                    page.params.collection
                );

                await invalidate(Dependencies.COLLECTION);
            } catch (e) {
                addNotification({
                    type: 'error',
                    message: e.message
                });
                $spreadsheetLoading = false;
                return;
            }
        }

        /* let the attributes be processed! */
        await sleep(1250);

        try {
            const documents = generateFakeDocuments(attributes, $randomDataModalState.value);
            await sdk
                .forProject(page.params.region, page.params.project)
                .databases.createDocuments(page.params.database, page.params.collection, documents);

            addNotification({
                type: 'success',
                message: 'Random data added successfully'
            });

            await invalidate(Dependencies.DOCUMENTS);
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
        }

        /* api is too fast! */
        await sleep(1250);
        $spreadsheetLoading = false;
    }
</script>

<svelte:head>
    <title>{$collection?.name ?? 'Collection'} - Appwrite</title>
</svelte:head>

<slot />

<SideSheet
    title={$showCreateAttributeSheet.title}
    bind:show={$showCreateAttributeSheet.show}
    submit={{
        text: 'Insert',
        onClick: async () => {
            await createAttribute?.submit();
        },
        disabled: !selectedOption
    }}>
    <CreateAttribute
        bind:selectedOption
        bind:this={createAttribute}
        showCreate={$showCreateAttributeSheet.show}
        direction={$showCreateAttributeSheet.direction}
        columns={$showCreateAttributeSheet.columns}
        columnsOrder={$showCreateAttributeSheet.columnsOrder}
        onColumnsReorder={(newOrder) => {
            columnsOrder.set(newOrder);
            columns.set(reorderItems($columns, $columnsOrder));
        }} />
</SideSheet>

<SideSheet
    title={$databaseColumnSheetOptions.title}
    bind:show={$databaseColumnSheetOptions.show}
    submit={{
        text: 'Update',
        disabled: $databaseColumnSheetOptions.disableSubmit,
        onClick: () => $databaseColumnSheetOptions.submitAction()
    }}>
    <EditAttribute
        isModal={false}
        showEdit={$databaseColumnSheetOptions.isEdit}
        selectedAttribute={$databaseColumnSheetOptions.column} />
</SideSheet>

<SideSheet
    title={$databaseRowSheetOptions.title}
    bind:show={$databaseRowSheetOptions.show}
    submit={{
        text: 'Update',
        disabled: editDocument?.isDisabled(),
        onClick: async () => await editDocument?.update()
    }}>
    <EditDocument bind:document={$databaseRowSheetOptions.document} bind:this={editDocument} />
</SideSheet>

<Dialog title="Generate random data" bind:open={$randomDataModalState.show}>
    <Layout.Stack style="gap: 28px;">
        <Typography.Text>
            Select how many random records to generate for testing. This won't delete or replace
            your existing records.
        </Typography.Text>

        <Seekbar max={100} breakpointCount={5} bind:value={$randomDataModalState.value} />
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
            <Button text on:click={() => ($randomDataModalState.show = false)}>Cancel</Button>
            <Button on:click={createFakeData}>Create</Button>
        </Layout.Stack>
    </svelte:fragment>
</Dialog>
