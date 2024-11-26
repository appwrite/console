<script lang="ts">
    import { PaginationWithLimit } from '$lib/components/index.js';
    import { Button, InputCheckbox, InputSearch } from '$lib/elements/forms';
    import Link from '$lib/elements/link.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import Container from '$lib/layout/container.svelte';
    import { consoleVariables } from '$routes/(console)/store.js';
    import type { Models } from '@appwrite.io/console';
    import { IconExternalLink, IconTrash } from '@appwrite.io/pink-icons-svelte';
    import { ActionMenu, Icon, Layout, Popover, Table } from '@appwrite.io/pink-svelte';

    export let data;
    $: console.log(data);

    let search = '';
    let showDelete = false;
    let selectedDomain: Models.ProxyRule = null;
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <div>
            <InputSearch placeholder="Search domains" bind:value={search} />
        </div>
        <Button>Add Domain</Button>
    </Layout.Stack>
    <Table.Root>
        <svelte:fragment slot="header">
            <Table.Header.Selector />
            <Table.Header.Cell>Domain</Table.Header.Cell>
            <Table.Header.Cell>Updated</Table.Header.Cell>
            <Table.Header.Cell />
        </svelte:fragment>
        {#each data.domains.rules as domain}
            <Table.Row>
                <Table.Cell>
                    <InputCheckbox id={domain.domain} />
                </Table.Cell>
                <Table.Cell>
                    <Layout.Stack direction="row" alignItems="center" gap="xs">
                        <Link
                            external
                            href={`${
                                $consoleVariables?._APP_OPTIONS_FORCE_HTTPS ? 'https://' : 'http://'
                            }${domain.domain}`}
                            size="s"
                            variant="quiet">
                            {domain.domain}
                        </Link>
                        <Icon icon={IconExternalLink} size="s" />
                    </Layout.Stack>
                </Table.Cell>
                <Table.Cell>{toLocaleDateTime(domain.$updatedAt)}</Table.Cell>
                <Table.Cell>
                    <Popover let:toggle placement="bottom-start" padding="none">
                        <button
                            class="button is-only-icon is-text"
                            aria-label="More options"
                            on:click|preventDefault={toggle}>
                            <span class="icon-dots-horizontal" aria-hidden="true" />
                        </button>
                        <svelte:fragment slot="tooltip" let:toggle>
                            <ActionMenu.Root>
                                <ActionMenu.Item.Button
                                    disabled
                                    status="danger"
                                    leadingIcon={IconTrash}
                                    on:click={(e) => {
                                        e.preventDefault();
                                        selectedDomain = domain;
                                        showDelete = true;
                                        toggle(e);
                                    }}>
                                    Delete
                                </ActionMenu.Item.Button>
                            </ActionMenu.Root>
                        </svelte:fragment>
                    </Popover>
                </Table.Cell>
            </Table.Row>
        {/each}
    </Table.Root>

    <PaginationWithLimit
        name="Domains"
        limit={data.limit}
        offset={data.offset}
        total={data.domains.total} />
</Container>
