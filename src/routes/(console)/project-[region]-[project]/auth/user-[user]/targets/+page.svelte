<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { PaginationWithLimit, ViewSelector, EmptyFilter } from '$lib/components';
    import { Container } from '$lib/layout';
    import Table from './table.svelte';
    import { Filters, hasPageQueries } from '$lib/components/filters';
    import { columns } from './store';
    import { View } from '$lib/helpers/load';
    import Create from './create.svelte';
    import { Card, Empty, Icon, Popover, Tag } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';

    export let data;
    let showAdd = false;
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
                        User targets include emails, phone numbers, and devices with your app
                        installed.<br /> These targets can subscribe to a topic and receive messages published
                        to it.
                    </p>
                </Popover>
            </div>

            <div class="u-flex u-main-end u-gap-16 is-not-mobile">
                <Filters query={data.query} {columns} />
                <ViewSelector ui="new" view={View.Table} {columns} hideView />
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
    {:else}
        <Card.Base padding="none">
            <Empty
                title="No targets available"
                description="No targets are assigned to this user. Messages can not be sent to them."
                type="secondary">
                <svelte:fragment slot="actions">
                    <Button
                        external
                        secondary
                        href="https://appwrite.io/docs/products/messaging/targets">
                        Documentation
                    </Button>
                </svelte:fragment>
            </Empty>
        </Card.Base>
    {/if}
</Container>

<Create bind:show={showAdd} on:close={() => (showAdd = false)} />
