<script lang="ts">
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { Link } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { IconDotsHorizontal, IconRefresh, IconTrash } from '@appwrite.io/pink-icons-svelte';
    import {
        ActionMenu,
        Badge,
        Icon,
        Layout,
        Popover,
        Table,
        Typography
    } from '@appwrite.io/pink-svelte';
    import DeleteDomainModal from './deleteDomainModal.svelte';
    import RetryDomainModal from './retryDomainModal.svelte';
    import { regionalProtocol } from '../../store';

    let {
        domains
    }: {
        domains: Models.ProxyRuleList;
    } = $props();

    let showDelete = $state(false);
    let showRetry = $state(false);
    let selectedDomain: Models.ProxyRule = $state(null);

    const columns = [
        {
            id: 'domain',
            title: 'Domain',
            type: 'string',
            format: 'string',
            width: { min: 200, max: 550 }
        }
    ];
</script>

<Table.Root columns={[...columns, { id: 'actions', width: 40 }]} let:root>
    <svelte:fragment slot="header" let:root>
        {#each columns as { id, title }}
            <Table.Header.Cell column={id} {root}>
                {title}
            </Table.Header.Cell>
        {/each}
        <Table.Header.Cell column="actions" {root} />
    </svelte:fragment>
    {#each domains.rules as domain}
        <Table.Row.Base {root}>
            {#each columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === 'domain'}
                        <Layout.Stack direction="row" gap="xs">
                            <Link
                                external
                                variant="quiet"
                                href={`${$regionalProtocol}${domain.domain}`}>
                                <Typography.Text truncate>
                                    {domain.domain}
                                </Typography.Text>
                            </Link>
                            {#if domain.status === 'verifying'}
                                <Badge variant="secondary" content="Verifying" size="s" />
                            {:else if domain.status !== 'verified'}
                                <Badge
                                    variant="secondary"
                                    type="warning"
                                    content="Verification failed"
                                    size="s" />
                            {/if}
                        </Layout.Stack>
                    {/if}
                </Table.Cell>
            {/each}
            <Table.Cell column="actions" {root}>
                <Layout.Stack direction="row" justifyContent="flex-end">
                    <Popover let:toggle placement="bottom-start" padding="none">
                        <Button
                            text
                            icon
                            on:click={(e) => {
                                e.preventDefault();
                                toggle(e);
                            }}>
                            <Icon icon={IconDotsHorizontal} size="s" />
                        </Button>

                        <svelte:fragment slot="tooltip" let:toggle>
                            <ActionMenu.Root>
                                {#if domain.status !== 'verified' && domain.status !== 'verifiying'}
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconRefresh}
                                        on:click={(e) => {
                                            selectedDomain = domain;
                                            showRetry = true;
                                            toggle(e);
                                        }}>
                                        Retry
                                    </ActionMenu.Item.Button>
                                {/if}
                                <ActionMenu.Item.Button
                                    status="danger"
                                    leadingIcon={IconTrash}
                                    on:click={(e) => {
                                        selectedDomain = domain;
                                        showDelete = true;
                                        toggle(e);
                                        trackEvent(Click.DomainDeleteClick, {
                                            source: 'settings_domain_overview'
                                        });
                                    }}>
                                    Delete
                                </ActionMenu.Item.Button>
                            </ActionMenu.Root>
                        </svelte:fragment>
                    </Popover>
                </Layout.Stack>
            </Table.Cell>
        </Table.Row.Base>
    {/each}
</Table.Root>

{#if showDelete}
    <DeleteDomainModal bind:show={showDelete} {selectedDomain} />
{/if}

{#if showRetry}
    <RetryDomainModal bind:show={showRetry} {selectedDomain} />
{/if}
