<script lang="ts">
    import { PaginationWithLimit, ViewSelector, EmptyFilter } from '$lib/components';
    import { Container } from '$lib/layout';
    import Table from './table.svelte';
    import { Filters, hasPageQueries } from '$lib/components/filters';
    import { View } from '$lib/helpers/load';
    import type { Column } from '$lib/helpers/types';
    import { writable } from 'svelte/store';
    import { Card, Empty, Icon, Popover, Tag } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';

    export let data;

    const columns = writable<Column[]>([
        { id: '$id', title: 'Identity ID', type: 'string', width: { min: 200 } },
        { id: 'provider', title: 'Provider', type: 'string', width: { min: 80 } },
        {
            id: 'providerUid',
            title: 'Provider UID',
            type: 'string',
            hide: true,
            width: { min: 80 }
        },
        { id: 'providerEmail', title: 'Email', type: 'string', width: { min: 80 } },
        {
            id: 'providerAccessTokenExpiry',
            title: 'Expiry Date',
            type: 'datetime'
        },
        { id: '$createdAt', title: 'Created', type: 'datetime', width: { min: 80 } },
        { id: '$updatedAt', title: 'Updated', type: 'datetime', hide: true, width: { min: 80 } }
    ]);
</script>

<Container>
    <div class="u-flex u-flex-vertical">
        <div class="u-flex u-main-space-between u-cross-center">
            <div class="u-flex u-gap-16 u-cross-center">
                <Popover let:toggle placement="bottom-start">
                    <Tag on:click={toggle}>
                        <Icon slot="start" icon={IconInfo} size="s" />
                        More info
                    </Tag>
                    <p slot="tooltip">
                        User identities are the user's connected OAuth accounts. <br /> The user can sign
                        in using these identities.
                    </p>
                </Popover>
            </div>
            <!-- TODO: Remove when searching is added -->
            <div class="u-flex u-main-end u-gap-16 is-not-mobile">
                <Filters query={data.query} {columns} />
                <div>
                    <ViewSelector ui="new" view={View.Table} {columns} hideView />
                </div>
            </div>
        </div>
        <div class="u-flex u-gap-16 is-only-mobile u-margin-block-start-16">
            <div class="u-flex-basis-50-percent">
                <ViewSelector ui="new" view={View.Table} {columns} hideView />
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
        <Card.Base padding="none">
            <Empty
                title="No identities available"
                description="Once this user signs in via OAuth, you'll see it here."
                type="secondary">
                <svelte:fragment slot="actions">
                    <Button external secondary href="https://appwrite.io/docs/products/auth/oauth2">
                        Documentation
                    </Button>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {/if}
</Container>
