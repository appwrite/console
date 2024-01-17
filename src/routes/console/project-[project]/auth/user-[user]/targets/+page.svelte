<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        EmptySearch,
        PaginationWithLimit,
        Heading,
        ViewSelector,
        EmptyFilter
    } from '$lib/components';
    import { Container } from '$lib/layout';
    import type { PageData } from './$types';
    import Table from './table.svelte';
    import { Filters, hasPageQueries } from '$lib/components/filters';
    import { columns } from './store';
    import { View } from '$lib/helpers/load';
    import Create from './create.svelte';

    export let data: PageData;
    let showAdd = false;
</script>

<Container>
    <div class="u-flex u-flex-vertical">
        <div class="u-flex u-main-space-between">
            <Heading tag="h2" size="5">Targets</Heading>
            <!-- TODO: Remove u-hide to add creating a target -->
            <div class="is-only-mobile u-hide">
                <Button on:click={() => (showAdd = true)} event="create_user_target">
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Add target</span>
                </Button>
            </div>
            <!-- TODO: Remove when searching is added -->
            <div class="u-flex u-main-end u-gap-16 is-not-mobile">
                <Filters query={data.query} {columns} />
                <div>
                    <ViewSelector
                        view={View.Table}
                        {columns}
                        hideView
                        allowNoColumns
                        showColsTextMobile />
                    <div class="u-hide">
                        <Button on:click={() => (showAdd = true)} event="create_user_target">
                            <span class="icon-plus" aria-hidden="true" />
                            <span class="text">Add target</span>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        <!-- TODO: Add searching when API supports it -->
        <!-- <SearchQuery search={data.search} placeholder="Search by name">
            <div class="u-flex u-gap-16 is-not-mobile">
                <Filters query={data.query} {columns} />
                <ViewSelector
                    view={View.Table}
                    {columns}
                    hideView
                    allowNoColumns
                    showColsTextMobile />
                <Button on:click={() => (showAdd = true)} event="create_user_target">
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Add target</span>
                </Button>
            </div>
        </SearchQuery> -->
        <div class="u-flex u-gap-16 is-only-mobile u-margin-block-start-16">
            <div class="u-flex-basis-50-percent">
                <!-- TODO: fix width -->
                <ViewSelector
                    view={View.Table}
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
    {#if data.targets.total}
        <Table {data} />

        <PaginationWithLimit
            name="Targets"
            limit={data.limit}
            offset={data.offset}
            total={data.targets.total} />
    {:else if $hasPageQueries}
        <EmptyFilter resource="targets" />
    {:else if data.search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find '{data.search}'</b>
                <p>There are no targets that match your search.</p>
            </div>
            <Button
                secondary
                href={`/console/project-${$page.params.project}/auth/user-${$page.params.user}/targets`}>
                Clear Search
            </Button>
        </EmptySearch>
    {:else}
        <!-- TODO: update docs link -->
        <Empty
            single
            on:click={() => (showAdd = true)}
            href="https://appwrite.io/docs/references/cloud/client-web/teams"
            target="subscriber" />
    {/if}
</Container>

<Create bind:show={showAdd} on:close={() => (showAdd = false)} />

