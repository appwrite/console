<script lang="ts">
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
    import { View } from '$lib/helpers/load';
    import type { Column } from '$lib/helpers/types';
    import { writable } from 'svelte/store';
    import { Pill } from '$lib/elements';

    export let data: PageData;

    let showMoreInfo = false;
    const columns = writable<Column[]>([
        { id: '$id', title: 'Identity ID', type: 'string', show: true, width: 140 },
        { id: 'provider', title: 'Provider', type: 'string', show: true, width: 80 },
        { id: 'providerUid', title: 'Provider UID', type: 'string', show: false, width: 80 },
        { id: 'providerEmail', title: 'Email', type: 'string', show: true, width: 80 },
        {
            id: 'providerAccessTokenExpiry',
            title: 'Expiry Date',
            type: 'datetime',
            show: true,
            width: 60
        },
        { id: '$createdAt', title: 'Created', type: 'datetime', show: true, width: 80 },
        { id: '$updatedAt', title: 'Updated', type: 'datetime', show: false, width: 80 }
    ]);
</script>

<Container>
    <div class="u-flex u-flex-vertical">
        <div class="u-flex u-main-space-between u-cross-center">
            <div class="u-flex u-gap-16 u-cross-center">
                <Heading tag="h2" size="5">Identities</Heading>
                <DropList bind:show={showMoreInfo} width="16">
                    <Pill button on:click={() => (showMoreInfo = !showMoreInfo)}>
                        <span class="icon-info" />More info
                    </Pill>
                    <svelte:fragment slot="list">
                        <slot name="tooltip">
                            <p>
                                User identities are the user's connected OAuth accounts. The user
                                can sign in using these identities.
                            </p>
                        </slot>
                    </svelte:fragment>
                </DropList>
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
                </div>
            </div>
        </div>
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
    {#if data.identities.total}
        <Table columns={$columns} {data} />

        <PaginationWithLimit
            name="Identities"
            limit={data.limit}
            offset={data.offset}
            total={data.identities.total} />
    {:else if $hasPageQueries}
        <EmptyFilter resource="identities" />
    {:else}
        <EmptySearch hidePagination>
            <div class="u-text-center">
                <p>This user has no identities.</p>
                <p>Once this user signs in via OAuth, you'll see it here.</p>
            </div>
        </EmptySearch>
    {/if}
</Container>
