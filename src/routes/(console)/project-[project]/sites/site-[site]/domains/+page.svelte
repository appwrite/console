<script lang="ts">
    import { PaginationWithLimit } from '$lib/components/index.js';
    import { Button, InputCheckbox, InputSearch } from '$lib/elements/forms';
    import Link from '$lib/elements/link.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import Container from '$lib/layout/container.svelte';
    import { IconExternalLink } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Table } from '@appwrite.io/pink-svelte';

    export let data;
    $: console.log(data);

    let search = '';
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
                        <Link href={domain.domain} size="s" variant="quiet">
                            {domain.domain}
                        </Link>
                        <Icon icon={IconExternalLink} size="s" />
                    </Layout.Stack>
                </Table.Cell>
                <Table.Cell>{toLocaleDateTime(domain.$updatedAt)}</Table.Cell>
                <Table.Cell>asd</Table.Cell>
            </Table.Row>
        {/each}
    </Table.Root>

    <PaginationWithLimit
        name="Domains"
        limit={data.limit}
        offset={data.offset}
        total={data.domains.total} />
</Container>
