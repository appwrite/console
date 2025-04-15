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
    import { realtime } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { collection } from './store';
    import { addSubPanel, registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import CreateAttribute from './createAttribute.svelte';
    import { writable } from 'svelte/store';
    import type { Option } from './attributes/store';
    import { CreateAttributePanel } from '$lib/commandCenter/panels';
    import { database } from '../store';
    import { project } from '$routes/(console)/project-[region]-[project]/store';
    import { page } from '$app/stores';
    import CreateIndex from './indexes/createIndex.svelte';
    import { wizard } from '$lib/stores/wizard';
    import CreateDocument from './createDocument.svelte';
    import { base } from '$app/paths';
    import { canWriteCollections } from '$lib/stores/roles';

    onMount(() => {
        return realtime
            .forProject($page.params.region, $page.params.project)
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
            keys: $page.url.pathname.endsWith($collection.$id) ? ['c'] : ['c', 'd'],
            callback() {
                wizard.start(CreateDocument);
            },
            icon: 'plus',
            group: 'documents'
        },
        {
            label: 'Create attribute',
            keys: $page.url.pathname.endsWith('attributes') ? ['c'] : ['c', 'a'],
            callback() {
                addSubPanel(CreateAttributePanel);
            },
            icon: 'plus',
            group: 'attributes',
            disabled: !$canWriteCollections
        },
        {
            label: 'Go to documents',
            keys: ['g', 'd'],
            callback() {
                goto(
                    `${base}/project-${$project?.$id}/databases/database-${$database?.$id}/collection-${$collection?.$id}`
                );
            },
            disabled: $page.url.pathname.endsWith($collection.$id),
            group: 'collections'
        },
        {
            label: 'Go to attributes',
            keys: ['g', 'a'],
            callback() {
                goto(
                    `${base}/project-${$project?.$id}/databases/database-${$database?.$id}/collection-${$collection?.$id}/attributes`
                );
            },
            disabled: $page.url.pathname.endsWith('attributes'),
            group: 'collections'
        },
        {
            label: 'Go to indexes',
            keys: ['g', 'i'],
            callback() {
                goto(
                    `${base}/project-${$project?.$id}/databases/database-${$database?.$id}/collection-${$collection?.$id}/indexes`
                );
            },
            disabled: $page.url.pathname.endsWith('indexes'),
            group: 'collections'
        },
        {
            label: 'Go to activity',
            keys: ['g', 'c'],
            callback() {
                goto(
                    `${base}/project-${$project?.$id}/databases/database-${$database?.$id}/collection-${$collection?.$id}/activity`
                );
            },
            disabled: $page.url.pathname.endsWith('activity'),
            group: 'collections'
        },
        {
            label: 'Go to usage',
            keys: ['g', 'u'],
            callback() {
                goto(
                    `${base}/project-${$project?.$id}/databases/database-${$database?.$id}/collection-${$collection?.$id}/usage`
                );
            },
            disabled: $page.url.pathname.endsWith('usage'),
            group: 'collections'
        },
        {
            label: 'Go to settings',
            keys: ['g', 's'],
            callback() {
                goto(
                    `${base}/project-${$project?.$id}/databases/database-${$database?.$id}/collection-${$collection?.$id}/settings`
                );
            },
            disabled: $page.url.pathname.endsWith('settings') || !$canWriteCollections,
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
                $page.url.pathname.endsWith('display-name') ||
                $page.url.pathname.endsWith('settings') ||
                !$canWriteCollections,
            icon: 'eye'
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
                $page.url.pathname.endsWith('permissions') ||
                $page.url.pathname.endsWith('settings') ||
                !$canWriteCollections,
            icon: 'puzzle'
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
                $page.url.pathname.endsWith('document-security') ||
                $page.url.pathname.endsWith('settings') ||
                !$canWriteCollections,
            icon: 'lock-closed'
        },
        {
            label: 'Create index',
            keys: $page.url.pathname.endsWith('indexes') ? ['c'] : ['c', 'i'],
            callback() {
                initCreateIndex();
            },
            icon: 'plus',
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
</script>

<svelte:head>
    <title>{$collection?.name ?? 'Collection'} - Appwrite</title>
</svelte:head>

<slot />

<CreateAttribute {...$createAttributeArgs} />
<CreateIndex bind:showCreateIndex={$showCreateIndex} />
