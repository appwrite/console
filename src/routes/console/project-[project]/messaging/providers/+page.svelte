<script lang="ts">
    import { page } from '$app/stores';
    import {
        TableHeader,
        TableBody,
        TableRowLink,
        TableCellHead,
        TableCellText,
        TableCell,
        TableCellHeadCheck,
        TableScroll,
        TableCellCheck
    } from '$lib/elements/table';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        EmptySearch,
        SearchQuery,
        PaginationWithLimit,
        Heading,
        Id,
        ViewSelector
    } from '$lib/components';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import type { PageData } from './$types';
    import { columns } from './store';
    import { Pill } from '$lib/elements';
    import Provider from '../provider.svelte';
    import ProviderType from '../providerType.svelte';
    import Filters from '$lib/components/filters/filters.svelte';
    import CreateProviderDropdown from './createProviderDropdown.svelte';

    export let data: PageData;

    let showCreateDropdownMobile = false;
    let showCreateDropdownDesktop = false;
    let showCreateDropdownEmpty = false;
    let selected: string[] = [];

    const project = $page.params.project;
</script>

<Container>
    <div class="u-flex u-flex-vertical">
        <div class="u-flex u-main-space-between">
            <Heading tag="h2" size="5">Providers</Heading>
            <div class="is-only-mobile">
                <CreateProviderDropdown bind:showCreateDropdown={showCreateDropdownMobile} />
            </div>
        </div>
        <!-- TODO: fix width of search input in mobile -->
        <SearchQuery search={data.search} placeholder="Search provider">
            <div class="u-flex u-gap-16 is-not-mobile">
                <Filters query={data.query} {columns} />
                <ViewSelector
                    view={data.view}
                    {columns}
                    hideView
                    allowNoColumns
                    showColsTextMobile />
                <CreateProviderDropdown bind:showCreateDropdown={showCreateDropdownDesktop} />
            </div>
        </SearchQuery>
        <div class="u-flex u-gap-16 is-only-mobile u-margin-block-start-16">
            <div class="u-flex-basis-50-percent">
                <!-- TODO: fix width -->
                <ViewSelector
                    view={data.view}
                    {columns}
                    hideView
                    allowNoColumns
                    showColsTextMobile />
            </div>
            <div class="u-flex-basis-50-percent">
                <!-- TODO: fix width -->
                <Filters query={data.query} {columns} />
            </div>
        </div>
    </div>
    {#if data.providers.total}
        <TableScroll>
            <TableHeader>
                <TableCellHeadCheck
                    bind:selected
                    pageItemsIds={data.providers.providers.map((d) => d.$id)} />
                {#each $columns as column}
                    {#if column.show}
                        <TableCellHead width={column.width}>{column.title}</TableCellHead>
                    {/if}
                {/each}
            </TableHeader>
            <TableBody>
                {#each data.providers.providers as provider (provider.$id)}
                    <TableRowLink
                        href={`${base}/console/project-${project}/messaging/providers/provider-${provider.$id}`}>
                        <TableCellCheck bind:selectedIds={selected} id={provider.$id} />
                        {#each $columns as column}
                            {#if column.show}
                                {#if column.id === '$id'}
                                    {#key $columns}
                                        <TableCell title={column.title} width={column.width}>
                                            <Id value={provider.$id}>{provider.$id}</Id>
                                        </TableCell>
                                    {/key}
                                {:else if column.id === 'provider'}
                                    <TableCellText title={column.title} width={column.width}>
                                        <Provider provider={provider.provider} size="s" />
                                    </TableCellText>
                                {:else if column.id === 'type'}
                                    <TableCellText title={column.title} width={column.width}>
                                        <ProviderType type={provider.type} size="s" />
                                    </TableCellText>
                                {:else if column.id === 'enabled'}
                                    <TableCellText title={column.title} width={column.width}>
                                        <Pill success={provider.enabled}>
                                            {#if provider.enabled}
                                                <span class="icon-check-circle" aria-hidden="true"
                                                ></span>
                                            {/if}
                                            <span class="text u-trim">
                                                {provider.enabled ? 'enabled' : 'disabled'}
                                            </span>
                                        </Pill>
                                    </TableCellText>
                                {:else}
                                    <TableCellText title={column.title} width={column.width}>
                                        {provider[column.id]}
                                    </TableCellText>
                                {/if}
                            {/if}
                        {/each}
                    </TableRowLink>
                {/each}
            </TableBody>
        </TableScroll>

        <PaginationWithLimit
            name="Providers"
            limit={data.limit}
            offset={data.offset}
            total={data.providers.total} />
    {:else if data.search && data.search != 'empty'}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find '{data.search}'</b>
                <p>There are no providers that match your search.</p>
            </div>
            <Button secondary href={`/console/project-${$page.params.project}/messaging/providers`}>
                Clear search
            </Button>
        </EmptySearch>
    {:else}
        <!-- TODO: Update docs links -->
        <Empty single target="provider">
            <div class="u-text-center">
                <Heading size="7" tag="h2" trimmed={false}>
                    Create your first provider to get started.
                </Heading>
                <p class="body-text-2 u-bold u-margin-block-start-4">
                    Need a hand? Learn more in our documentation.
                </p>
            </div>
            <div class="u-flex u-flex-wrap u-gap-16 u-main-center">
                <Button
                    external
                    href="https://appwrite.io/docs/references/cloud/client-web/providers"
                    text
                    event="empty_documentation"
                    ariaLabel={`create provider`}>
                    Documentation
                </Button>
                <CreateProviderDropdown bind:showCreateDropdown={showCreateDropdownEmpty}>
                    <Button
                        secondary
                        on:click={() => (showCreateDropdownEmpty = !showCreateDropdownEmpty)}
                        event="create_provider">
                        <span class="text">Create provider</span>
                    </Button>
                </CreateProviderDropdown>
            </div>
        </Empty>
    {/if}
</Container>
