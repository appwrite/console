<script lang="ts" context="module">
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
    import { sdk } from '$lib/stores/sdk';
    import { onDestroy, onMount } from 'svelte';
    import { collection } from './store';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import CreateAttribute from './createAttribute.svelte';
    import { writable } from 'svelte/store';
    import type { Option } from './attributes/store';
    import { CreateAttributePanel } from '$lib/commandCenter/panels';
    import { database } from '../store';
    import { project } from '$routes/console/project-[project]/store';
    import { page } from '$app/stores';
    import CreateIndex from './indexes/createIndex.svelte';
    import { wizard } from '$lib/stores/wizard';
    import CreateDocument from './createDocument.svelte';

    let unsubscribe: { (): void };

    onMount(() => {
        unsubscribe = sdk.forConsole.client.subscribe('console', (response) => {
            if (
                response.events.includes('databases.*.collections.*.attributes.*') ||
                response.events.includes('databases.*.collections.*.indexes.*')
            ) {
                invalidate(Dependencies.COLLECTION);
            }
        });
    });

    onDestroy(() => {
        if (unsubscribe) {
            unsubscribe();
        }
    });

    $: $registerCommands([
        {
            label: 'Create Document',
            keys: $page.url.pathname.endsWith($collection.$id) ? ['c'] : ['c', 'd'],
            callback() {
                wizard.start(CreateDocument);
            },
            icon: 'plus',
            group: 'documents'
        },
        {
            label: 'Create Attribute',
            keys: $page.url.pathname.endsWith('attributes') ? ['c'] : ['c', 'a'],
            callback() {
                addSubPanel(CreateAttributePanel);
            },
            icon: 'plus',
            group: 'attributes'
        },
        {
            label: 'Go to Documents',
            keys: ['g', 'd'],
            callback() {
                goto(
                    `/console/project-${$project?.$id}/databases/database-${$database?.$id}/collection-${$collection?.$id}`
                );
            },
            disabled: $page.url.pathname.endsWith($collection.$id),
            group: 'collections'
        },
        {
            label: 'Go to Attributes',
            keys: ['g', 'a'],
            callback() {
                goto(
                    `/console/project-${$project?.$id}/databases/database-${$database?.$id}/collection-${$collection?.$id}/attributes`
                );
            },
            disabled: $page.url.pathname.endsWith('attributes'),
            group: 'collections'
        },
        {
            label: 'Go to Indexes',
            keys: ['g', 'i'],
            callback() {
                goto(
                    `/console/project-${$project?.$id}/databases/database-${$database?.$id}/collection-${$collection?.$id}/indexes`
                );
            },
            disabled: $page.url.pathname.endsWith('indexes'),
            group: 'collections'
        },
        {
            label: 'Go to Activity',
            keys: ['g', 'c'],
            callback() {
                goto(
                    `/console/project-${$project?.$id}/databases/database-${$database?.$id}/collection-${$collection?.$id}/activity`
                );
            },
            disabled: $page.url.pathname.endsWith('activity'),
            group: 'collections'
        },
        {
            label: 'Go to Usage',
            keys: ['g', 'u'],
            callback() {
                goto(
                    `/console/project-${$project?.$id}/databases/database-${$database?.$id}/collection-${$collection?.$id}/usage`
                );
            },
            disabled: $page.url.pathname.endsWith('usage'),
            group: 'collections'
        },
        {
            label: 'Go to Settings',
            keys: ['g', 's'],
            callback() {
                goto(
                    `/console/project-${$project?.$id}/databases/database-${$database?.$id}/collection-${$collection?.$id}/settings`
                );
            },
            disabled: $page.url.pathname.endsWith('settings'),
            group: 'collections'
        },
        {
            label: 'Create Index',
            keys: $page.url.pathname.endsWith('indexes') ? ['c'] : ['c', 'i'],
            callback() {
                initCreateIndex();
            },
            icon: 'plus',
            group: 'indexes'
        }
    ]);

    $updateCommandGroupRanks((p) => ({
        ...p,
        attributes: 1000,
        documents: 900,
        collections: 800,
        indexes: 700
    }));
</script>

<svelte:head>
    <title>{$collection?.name ?? 'Collection'} - Appwrite</title>
</svelte:head>

<slot />

<CreateAttribute {...$createAttributeArgs} />
<CreateIndex bind:showCreateIndex={$showCreateIndex} />
