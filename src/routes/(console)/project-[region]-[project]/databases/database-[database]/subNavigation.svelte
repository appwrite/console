<script lang="ts">
    import { page } from '$app/state';
    import type { PageData } from './$types';
    import { showSubNavigation } from '$lib/stores/layout';
    import { bannerSpacing } from '$lib/layout/headerAlert.svelte';
    import { showCreateEntity, databaseSubNavigationItems, buildEntityRoute } from './store';

    import {
        Icon,
        Sidebar,
        Navbar,
        Layout,
        Link,
        Typography,
        Divider
    } from '@appwrite.io/pink-svelte';
    import {
        IconChevronDown,
        IconDatabase,
        IconPlus,
        IconTable
    } from '@appwrite.io/pink-icons-svelte';
    import { isTabletViewport } from '$lib/stores/viewport';
    import { BottomSheet } from '$lib/components';
    import Button from '$lib/elements/forms/button.svelte';
    import { Query } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { subNavigation } from '$lib/stores/database';
    import {
        type Entity,
        type EntityList,
        toSupportiveEntity,
        useTerminology
    } from '$database/(entity)';
    import { resolveRoute } from '$lib/stores/navigation';
    import { withPath } from '$lib/stores/navigation.js';

    const data = $derived(page.data) as PageData;

    // terminologies
    const terminology = $derived(useTerminology(page));
    const entityTypePlural = $derived(terminology.entity.lower.plural);
    const entityTypeSingular = $derived(terminology.entity.lower.singular);

    const region = $derived(page.params.region);
    const project = $derived(page.params.project);
    const databaseId = $derived(page.params.database);
    const entityId = $derived(page.params[entityTypeSingular]);

    let openBottomSheet = $state(false);

    let entities = $state<EntityList>({ total: 0, entities: [] });

    const sortedEntities = $derived.by(() =>
        entities?.entities?.slice().sort((a, b) => a.name.localeCompare(b.name))
    );

    const selectedEntity = $derived.by(() =>
        sortedEntities?.find((entity: Entity) => entity.$id === entityId)
    );

    const isEntitiesScreen = $derived(
        page.route.id.endsWith(`${entityTypeSingular}-[${entityTypeSingular}]`)
    );

    const isMainDatabaseScreen = $derived(page.route.id.endsWith('database-[database]'));

    // If banner open, adjust bottom position to account for banner container.
    // 70.5px is the size of the container of the banner holder and not just the banner!
    // Needed because things vary a bit much on how different browsers treat bottom layouts.
    const bottomNavOffset = $derived($bannerSpacing ? '70.5px' : '0px');
    const entityContentPadding = $derived($bannerSpacing ? '210px' : '140px');

    const databaseBaseRoute = $derived(
        resolveRoute(
            '/(console)/project-[region]-[project]/databases/database-[database]',
            page.params
        )
    );

    async function loadEntities() {
        const projectSdk = sdk.forProject(region, project);
        const params = { databaseId, queries: [Query.orderDesc(''), Query.limit(100)] };

        switch (terminology.type) {
            case 'tablesdb': {
                const { total, tables } = await projectSdk.tablesDB.listTables(params);
                entities = { total, entities: tables.map(toSupportiveEntity) };
                break;
            }
            case 'documentsdb': {
                const { total, collections } = await projectSdk.documentsDB.listCollections(params);
                entities = { total, entities: collections.map(toSupportiveEntity) };
                break;
            }
        }
    }

    onMount(() => {
        loadEntities();
        return subNavigation.subscribe(loadEntities);
    });

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
                href={databaseBaseRoute}
                class:is-selected={!isEntitiesScreen}
                class="database-name u-flex u-cross-center body-text-2 u-gap-8 is-not-mobile u-padding-block-8 u-padding-inline-start-4">
                <Icon icon={IconDatabase} size="s" color="--fgcolor-neutral-weak" />

                {data.database?.name}
            </a>
            <div class="entity-content" style:padding-bottom={entityContentPadding}>
                {#if entities?.total}
                    <ul class="drop-list u-margin-inline-start-8 u-margin-block-start-4">
                        {#each sortedEntities as entity, index}
                            {@const isFirst = index === 0}
                            {@const isSelected = entityId === entity.$id}
                            {@const isLast = index === sortedEntities.length - 1}
                            {@const href = buildEntityRoute(page, entityTypeSingular, entity.$id)}

                            <Layout.Stack gap="s" direction="row" alignItems="center">
                                <li
                                    class:is-last={isLast}
                                    class:is-first={isFirst}
                                    class:is-selected={isSelected}>
                                    <a
                                        class="u-padding-block-8 u-padding-inline-end-4 u-padding-inline-start-8 u-flex u-cross-center u-gap-8"
                                        {href}>
                                        <Icon
                                            icon={IconTable}
                                            size="s"
                                            color={isSelected
                                                ? '--fgcolor-neutral-tertiary'
                                                : '--fgcolor-neutral-weak'} />
                                        <span class="text entity-name" data-private
                                            >{entity.name}</span>
                                    </a>
                                </li>
                            </Layout.Stack>
                        {/each}
                    </ul>
                {:else}
                    <div style:padding-block="0.75rem">
                        <Layout.Stack
                            gap="m"
                            direction="row"
                            alignItems="center"
                            class="u-margin-inline-start-8 u-margin-block-start-8">
                            <div
                                style:border-left="1px solid var(--border-neutral, #ededf0)"
                                style:height="1rem">
                            </div>
                            No {entityTypePlural} yet
                        </Layout.Stack>
                    </div>
                {/if}

                <Layout.Stack
                    alignItems="center"
                    direction="row"
                    style="gap: 3px; margin-block-start: 8px;">
                    <Icon icon={IconPlus} size="s" />
                    <Button
                        compact
                        on:click={() => {
                            $showCreateEntity = true;
                            $showSubNavigation = false;
                        }}>
                        Create {entityTypeSingular}
                    </Button>
                </Layout.Stack>
            </div>

            <div class="bottom-nav-container" style:bottom={bottomNavOffset}>
                <div class="action-menu-divider">
                    <Divider />
                </div>

                <ul
                    style="margin-inline-start: -1.25rem"
                    class="drop-list bottom-nav u-margin-block-start-4">
                    {#each databaseSubNavigationItems as action}
                        {@const href = withPath(databaseBaseRoute, `/${action.href}`)}

                        <Layout.Stack gap="s" direction="row" alignItems="center">
                            <li class="bottom-nav-item">
                                <a
                                    {href}
                                    class="u-padding-block-8 u-padding-inline-end-4 u-padding-inline-start-8 u-flex u-cross-center u-gap-8">
                                    <Icon
                                        size="s"
                                        icon={action.icon}
                                        color="--fgcolor-neutral-weak" />
                                    <span class="text entity-name">{action.title}</span>
                                </a>
                            </li>
                        </Layout.Stack>
                    {/each}
                </ul>
            </div>
        </section>
    </Sidebar.Base>
{:else if data?.database?.name && !isMainDatabaseScreen}
    <Navbar.Base>
        <div slot="left">
            <Layout.Stack direction="row" alignItems="center" gap="s">
                <Icon icon={IconDatabase} size="s" color="--neutral-300" />
                <Link.Anchor href={databaseBaseRoute} variant="quiet-muted">
                    {data.database.name}
                </Link.Anchor>

                <span style:margin-left="8px">/</span>

                <Button text extraCompact on:click={() => (openBottomSheet = !openBottomSheet)}>
                    <Typography.Text variant="m-400">
                        {selectedEntity?.name}
                    </Typography.Text>
                    <Icon icon={IconChevronDown} size="s" />
                </Button>
            </Layout.Stack>
        </div>
    </Navbar.Base>
{/if}
{#if openBottomSheet}
    <BottomSheet.Menu
        bind:isOpen={openBottomSheet}
        menu={{
            top: {
                items: sortedEntities.slice(0, 10).map((entity) => {
                    return {
                        name: entity.name,
                        leadingIcon: IconTable,
                        href: buildEntityRoute(page, entityTypeSingular, entity.$id)
                    };
                })
            },
            bottom:
                sortedEntities.length > 10
                    ? {
                          items: [
                              {
                                  name: 'All tables',
                                  leadingIcon: IconTable,
                                  href: databaseBaseRoute
                              }
                          ]
                      }
                    : undefined
        }}></BottomSheet.Menu>
{/if}

<style lang="scss">
    .list-container {
        height: 100%;
        display: flex;
        min-height: 0;
        flex-direction: column;
    }

    .database-name {
        margin-block-end: 4px;
        font-size: var(--font-size-sm);
        color: var(--fgcolor-neutral-secondary);

        &:hover {
            color: var(--fgcolor-neutral-primary);
            border-radius: var(--border-radius-s, 6px);
            background: var(--bgcolor-neutral-secondary);
        }
    }

    .entity-content {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
        min-height: 0;
        margin-bottom: auto;
        color: var(--fgcolor-neutral-secondary, #56565c);

        /* hide scrollbars */
        scrollbar-width: none;
        -ms-overflow-style: none;

        // scrollbar-width: thin;
        // scrollbar-color: var(--border-neutral, #ededf0) transparent;

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
        flex: 1;
        gap: 4px;
        padding-left: 4px;
        position: relative;
        font-size: var(--font-size-sm);
        color: var(--fgcolor-neutral-secondary);

        &::-webkit-scrollbar {
            display: none;
        }

        &:not(.bottom-nav)::before {
            content: '';
            right: 99%;
            top: 0.2rem;
            bottom: 0.2rem;
            position: absolute;
            border-left: 1px solid var(--border-neutral, #ededf0);
        }

        // first item
        &:not(.bottom-nav):has(li.is-first)::before {
            top: 0.8rem;
        }

        // last item
        &:not(.bottom-nav):has(li.is-last)::before {
            bottom: 0.85rem;
        }

        // the only item
        &:not(.bottom-nav):has(li.is-first.is-last)::before {
            top: 0.6rem;
            bottom: 0.6rem;
        }

        li {
            width: 100%;
            overflow: hidden;
            position: relative;
            padding-inline-end: 0.5rem;
            margin-inline-start: 0.5rem;

            &:hover {
                color: var(--fgcolor-neutral-primary);
                border-radius: var(--border-radius-s, 6px);
                background: var(--bgcolor-neutral-secondary);
            }

            &.bottom-nav-item:hover {
                margin-inline-end: 1.25rem;
            }
        }

        .entity-name {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            line-clamp: 1;
            color: var(--fgcolor-neutral-secondary, #56565c);
        }
    }

    .is-selected {
        color: var(--fgcolor-neutral-primary);
        border-radius: var(--border-radius-s, 6px);
        background: var(--bgcolor-neutral-secondary);
    }

    :global(.sub-navigation header) {
        top: 48px !important;
    }

    :global(.trigger) {
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

    .bottom-nav-container {
        right: 0;
        bottom: 0;
        left: 1.25rem;
        position: absolute;
        padding-block-end: 1rem;
    }

    .action-menu-divider {
        padding-block-end: 0.25rem;
        margin-inline-start: -1.25rem;
    }
</style>
