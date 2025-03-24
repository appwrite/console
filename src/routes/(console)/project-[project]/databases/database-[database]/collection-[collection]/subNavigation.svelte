<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { showCreate } from '../store';
    import type { PageData } from './$types';
    import { showSubNavigation } from '$lib/stores/layout';
    import { Icon, Sidebar, Navbar, Layout, Link, ActionMenu } from '@appwrite.io/pink-svelte';
    import {
        IconChevronDown,
        IconDatabase,
        IconPlus,
        IconTable
    } from '@appwrite.io/pink-icons-svelte';
    import { isTabletViewport } from '$lib/stores/viewport';
    import { BottomSheet } from '$lib/components';

    $: data = $page.data as PageData;
    $: project = $page.params.project;
    $: databaseId = $page.params.database;
    $: collectionId = $page.params.collection;

    $: sortedCollections = data?.allCollections?.collections?.sort((a, b) =>
        a.name.localeCompare(b.name)
    );

    $: selectedCollection = sortedCollections?.find(
        (collection) => collection.$id === collectionId
    );

    let openBottomSheet = false;

    function onResize() {
        if (openBottomSheet && !$isTabletViewport) {
            openBottomSheet = false;
        }
    }
</script>

<svelte:window on:resize={onResize} />
{#if !$isTabletViewport}
    <Sidebar.Base state="open" resizable={false}>
        <section class="list-container" slot="top" style:width="100%">
            <a
                href={`${base}/project-${project}/databases/database-${databaseId}`}
                class="database-name u-flex u-cross-center body-text-2 u-gap-8 is-not-mobile is-selected">
                <Icon icon={IconDatabase} size="s" color="--fgcolor-neutral-weak" />
                {data.database.name}
            </a>
            <div class="collection-content">
                {#if data?.allCollections?.total}
                    <ul class="drop-list u-margin-inline-start-8 u-margin-block-start-8">
                        {#each sortedCollections as collection}
                            {@const href = `${base}/project-${project}/databases/database-${databaseId}/collection-${collection.$id}`}
                            {@const isSelected = collectionId === collection.$id}
                            <li class:is-selected={isSelected}>
                                <a
                                    class="u-padding-block-8 u-padding-inline-end-4 u-padding-inline-start-8 u-flex u-cross-center u-gap-8"
                                    {href}>
                                    <Icon
                                        icon={IconTable}
                                        size="s"
                                        color={isSelected
                                            ? '--fgcolor-neutral-tertiary'
                                            : '--fgcolor-neutral-weak'} />
                                    <span class="text collection-name" data-private
                                        >{collection.name}</span>
                                </a>
                            </li>
                        {/each}
                    </ul>
                {/if}
            </div>
            <ActionMenu.Root noPadding width="167">
                <ActionMenu.Item.Button
                    on:click={() => {
                        $showCreate = true;
                        $showSubNavigation = false;
                    }}
                    leadingIcon={IconPlus}>
                    Create collection
                </ActionMenu.Item.Button>
            </ActionMenu.Root>
        </section>
    </Sidebar.Base>
{:else}
    <Navbar.Base>
        <div slot="left">
            <Layout.Stack direction="row" alignItems="center" gap="s">
                <Icon icon={IconDatabase} size="s" color="--neutral-300" />
                <Link.Anchor
                    href={`${base}/project-${project}/databases/database-${databaseId}`}
                    variant="quiet-muted">{data.database.name}</Link.Anchor>
                <span style:margin-left="8px">/</span>
                <button
                    type="button"
                    class="trigger"
                    aria-label="Open collections"
                    on:click={() => {
                        openBottomSheet = !openBottomSheet;
                    }}>
                    <span class="orgName">{selectedCollection.name}</span>
                    <Icon icon={IconChevronDown} size="s" />
                </button>
            </Layout.Stack>
        </div>
    </Navbar.Base>
{/if}
{#if openBottomSheet}
    <BottomSheet.Menu
        bind:isOpen={openBottomSheet}
        menu={{
            top: {
                items: sortedCollections.slice(0, 10).map((collection) => {
                    return {
                        name: collection.name,
                        leadingIcon: IconTable,
                        href: `${base}/project-${project}/databases/database-${databaseId}/collection-${collection.$id}`
                    };
                })
            },
            bottom:
                sortedCollections.length > 10
                    ? {
                          items: [
                              {
                                  name: 'All collections',
                                  leadingIcon: IconTable,
                                  href: `${base}/project-${project}/databases/database-${databaseId}`
                              }
                          ]
                      }
                    : undefined
        }}></BottomSheet.Menu>
{/if}

<style lang="scss">
    .list-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        min-height: 0;
    }

    .database-name {
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--fgcolor-neutral-secondary);
    }

    .collection-content {
        flex: 1;
        overflow-y: auto;
        min-height: 0;
        margin-bottom: auto;
        padding-bottom: 16px;
        scrollbar-width: thin;
        scrollbar-color: var(--border-neutral, #ededf0) transparent;
        color: var(--fgcolor-neutral-secondary, #56565c);

        &::-webkit-scrollbar {
            width: 4px;
            height: 4px;
        }

        &::-webkit-scrollbar-track {
            background: transparent;
            border-radius: 2px;
        }

        &::-webkit-scrollbar-thumb {
            background: var(--border-neutral, #ededf0);
            border-radius: 2px;

            &:hover {
                background: var(--border-neutral-emphasis, #dbdbdf);
            }
        }
    }

    .drop-list {
        border-left: 1px solid var(--border-neutral, #ededf0);
        flex: 1;
        padding-left: 4px;
        font-size: var(--font-size-sm);
        font-weight: 500;
        color: var(--fgcolor-neutral-secondary);

        .is-selected,
        li:hover {
            color: var(--fgcolor-neutral-primary);
            border-radius: var(--border-radius-xs, 4px);
            background: var(--bgcolor-neutral-secondary);
        }

        .collection-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-clamp: 1;
            color: var(--fgcolor-neutral-secondary, #56565c);
        }
    }

    :global(.sub-navigation header) {
        top: 48px !important;
    }
    .trigger {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: var(--space-1, 2px) var(--space-2, 4px) var(--space-1, 2px) var(--space-3, 6px);
        gap: var(--space-2, 4px);
        transition: color 0.2s ease;

        color: var(--fgcolor-neutral-secondary);
        border-radius: var(--corner-radius-medium, 8px);

        cursor: default;
        /* Body text/level 2 Regular */
        font-family: Inter;
        font-size: 14px;
        font-style: normal;
        font-weight: 400;
        line-height: 150%; /* 21px */
    }
</style>
