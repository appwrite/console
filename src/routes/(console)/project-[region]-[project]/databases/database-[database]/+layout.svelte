<script lang="ts">
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import {
        addSubPanel,
        registerCommands,
        registerSearchers,
        updateCommandGroupRanks
    } from '$lib/commandCenter';
    import { tablesSearcher } from '$lib/commandCenter/searchers';
    import { Dependencies } from '$lib/constants';
    import { showCreateEntity, randomDataModalState, resetSampleFieldsConfig } from './store';
    import { entityColumnSuggestions } from './(suggestions)/store';
    import { TablesPanel } from '$lib/commandCenter/panels';
    import { canWriteTables, canWriteDatabases } from '$lib/stores/roles';
    import { showCreateBackup, showCreatePolicy } from './backups/store';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { currentPlan } from '$lib/stores/organization';
    import { isCloud } from '$lib/system';
    import { noWidthTransition } from '$lib/stores/sidebar';
    import { CreateEntity, getTerminologies } from '$database/(entity)';
    import { resolveRoute, withPath } from '$lib/stores/navigation';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { Button, Seekbar } from '$lib/elements/forms';
    import type { Snippet } from 'svelte';
    import { Input as SuggestionsInput } from '$database/(suggestions)/index';
    import { Modal } from '$lib/components';

    let {
        children
    }: {
        children: Snippet;
    } = $props();

    const project = page.params.project;
    const databaseId = page.params.database;

    const { databaseSdk, terminology } = getTerminologies();

    $noWidthTransition = true;

    $registerSearchers(tablesSearcher);

    async function createEntity(entityId: string, name: string) {
        const entity = await databaseSdk.createEntity({
            databaseId,
            entityId,
            name
        });

        await invalidate(Dependencies.DATABASE);
        await goto(
            withPath(
                resolveRoute(
                    '/(console)/project-[region]-[project]/databases/database-[database]',
                    page.params
                ),
                `/${terminology.entity.lower.singular}-${entity.$id}`
            )
        );

        if ($entityColumnSuggestions.enabled) {
            $randomDataModalState.columns = true;
            await $randomDataModalState.onSubmit?.();
        }

        resetSampleFieldsConfig();
    }

    $effect(() => {
        $registerCommands([
            {
                label: 'Create table',
                callback() {
                    $showCreateEntity = true;
                    if (!page.url.pathname.endsWith(databaseId)) {
                        goto(
                            `${base}/project-${page.params.region}-${project}/databases/database-${databaseId}`
                        );
                    }
                },
                keys: page.url.pathname.endsWith(databaseId) ? ['c'] : ['c', 'c'],
                disabled: page.url.pathname.includes('table-') || !$canWriteTables,
                group: 'databases',
                icon: IconPlus
            },
            {
                label: 'Create backup policy',
                callback: async () => {
                    if (!page.url.pathname.endsWith('backups')) {
                        goto(
                            `${base}/project-${page.params.region}-${project}/databases/database-${databaseId}/backups`
                        );
                    }
                    showCreatePolicy.set(true);
                },
                keys: page.url.pathname.endsWith('backups') ? ['c'] : ['c', 'p'],
                group: 'databases',
                icon: IconPlus,
                rank: page.url.pathname.endsWith('backups') ? 10 : 0,
                disabled: !isCloud || !$currentPlan?.backupsEnabled
            },
            {
                label: 'Create manual backup',
                callback: async () => {
                    if (!page.url.pathname.endsWith('backups')) {
                        goto(
                            `${base}/project-${page.params.region}-${project}/databases/database-${databaseId}/backups`
                        );
                    }
                    showCreateBackup.set(true);
                },
                keys: page.url.pathname.endsWith('backups') ? ['c'] : ['c', 'b'],
                group: 'databases',
                icon: IconPlus,
                rank: page.url.pathname.endsWith('backups') ? 10 : 0,
                disabled: !isCloud || !$currentPlan?.backupsEnabled
            },
            {
                label: 'Go to tables',
                callback() {
                    goto(
                        `${base}/project-${page.params.region}-${project}/databases/database-${databaseId}`
                    );
                },
                disabled:
                    page.url.pathname.endsWith(databaseId) || page.url.pathname.includes('table-'),
                keys: ['g', 'c'],
                group: 'databases'
            },
            {
                label: 'Go to usage',
                callback() {
                    goto(
                        `${base}/project-${page.params.region}-${project}/databases/database-${databaseId}/usage`
                    );
                },
                disabled:
                    page.url.pathname.includes('/usage') || page.url.pathname.includes('table-'),
                keys: ['g', 'u'],
                group: 'databases'
            },
            {
                label: 'Go to backups',
                callback() {
                    goto(
                        `${base}/project-${page.params.region}-${project}/databases/database-${databaseId}/backups`
                    );
                },
                disabled:
                    page.url.pathname.includes('/backups') || page.url.pathname.includes('table-'),
                keys: ['g', 'b'],
                group: 'databases'
            },
            {
                label: 'Go to settings',
                callback() {
                    goto(
                        `${base}/project-${page.params.region}-${project}/databases/database-${databaseId}/settings`
                    );
                },
                disabled:
                    page.url.pathname.includes('/settings') ||
                    page.url.pathname.includes('table-') ||
                    !$canWriteDatabases,
                keys: ['g', 's'],
                group: 'databases'
            },
            {
                label: 'Find tables',
                callback: () => {
                    addSubPanel(TablesPanel);
                },
                group: 'databases',
                rank: -1
            }
        ]);
    });

    $effect(() => {
        $updateCommandGroupRanks({ tables: 10 });
    });
</script>

<svelte:head>
    <!-- svelte bug, the table header just stays! -->
    {#key page.url.pathname}
        <title>Database - Appwrite</title>
    {/key}
</svelte:head>

{@render children()}

<CreateEntity bind:show={$showCreateEntity} onCreateEntity={createEntity} />

{#if !$randomDataModalState.managed}
    <Modal title="Generate sample data" bind:show={$randomDataModalState.show}>
        <Layout.Stack style="gap: 28px;">
            {#if $randomDataModalState.columns}
                <SuggestionsInput required context="data" showSampleCountPicker={!terminology.schema} />
            {:else}
                <Seekbar max={100} breakpointCount={5} bind:value={$randomDataModalState.value} />
            {/if}
        </Layout.Stack>

        <svelte:fragment slot="footer">
            <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
                <Button text on:click={() => resetSampleFieldsConfig()}>Cancel</Button>
                <Button
                    on:click={() => {
                        $randomDataModalState.onSubmit?.();
                        $randomDataModalState.show = false;
                    }}>Create</Button>
            </Layout.Stack>
        </svelte:fragment>
    </Modal>
{/if}