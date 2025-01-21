<script lang="ts">
    import { CardGrid } from '$lib/components';
    import Heading from '$lib/components/heading.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';
    import { Table } from '@appwrite.io/pink-svelte';

    export let domain: Models.ProxyRule;
</script>

<CardGrid>
    <Heading tag="h6" size="7">SSL certificates</Heading>
    <p>
        SSL certificates secure your site with HTTPS, protecting data and boosting trust. Appwrite
        renews your SSL certificates automatically.
    </p>
    <svelte:fragment slot="aside">
        <Table.Root>
            <svelte:fragment slot="header">
                <Table.Header.Cell>Domain</Table.Header.Cell>
                <Table.Header.Cell>Expiration date</Table.Header.Cell>
                <Table.Header.Cell>Renewal</Table.Header.Cell>
                <Table.Header.Cell>Created</Table.Header.Cell>
                <Table.Header.Cell />
            </svelte:fragment>
            {#each domain.logs as log}
                <Table.Row>
                    {JSON.stringify(domain)}
                </Table.Row>
            {/each}
        </Table.Root>
    </svelte:fragment>
</CardGrid>
