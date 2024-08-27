<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import {
        PaginationWithLimit,
        Heading,
        ViewSelector,
        EmptyFilter,
        EmptySearch,
        DropList
    } from '$lib/components';
    import { Container } from '$lib/layout';
    import type { PageData } from './$types';
    import Table from './table.svelte';
    import { Filters, hasPageQueries } from '$lib/components/filters';
    import { columns } from './store';
    import { View } from '$lib/helpers/load';
    import Create from './create.svelte';
    import { Pill } from '$lib/elements';

    export let data: PageData;
    let showAdd = false;
    let showMoreInfo = false;
</script>

<Container>
    <div class="u-flex u-flex-vertical">
        <div class="u-flex u-main-space-between u-cross-center">
            <div class="u-flex u-gap-16 u-cross-center">
                <Heading tag="h2" size="5">Targets</Heading>
                <DropList bind:show={showMoreInfo} width="16">
                    <Pill button on:click={() => (showMoreInfo = !showMoreInfo)}>
                        <span class="icon-info" />More info
                    </Pill>
                    <svelte:fragment slot="list">
                        <slot name="tooltip">
                            <p>
                                User targets include emails, phone numbers, and devices with your
                                app installed. These targets can subscribe to a topic and receive
                                messages published to it.
                            </p>
                        </slot>
                    </svelte:fragment>
                </DropList>
            </div>

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
                <ViewSelector
                    view={View.Table}
                    {columns}
                    hideView
                    allowNoColumns
                    showColsTextMobile
                    fullWidthMobile />
            </div>
            <div class="u-flex-basis-50-percent">
                <Filters query={data.query} {columns} fullWidthMobile />
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
        <!-- {:else if data.search}
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
        </EmptySearch> -->
    {:else}
        <EmptySearch hidePagination>
            <div class="u-text-center">
                <p>No targets are assigned to this user. Messages can not be sent to them.</p>
                <p>
                    Need a hand? Check out our <Button
                        link
                        external
                        href="https://appwrite.io/docs/products/messaging/targets"
                        text>
                        documentation</Button
                    >.
                </p>
            </div>
        </EmptySearch>
    {/if}
</Container>

<Create bind:show={showAdd} on:close={() => (showAdd = false)} />
