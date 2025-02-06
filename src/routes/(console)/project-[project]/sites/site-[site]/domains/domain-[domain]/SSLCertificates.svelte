<script lang="ts">
    import { CardGrid } from '$lib/components';
    import type { Models } from '@appwrite.io/console';
    import { Table } from '@appwrite.io/pink-svelte';

    export let domain: Models.ProxyRule;
</script>

<CardGrid>
    <svelte:fragment slot="title">SSL Certificates</svelte:fragment>
    SSL certificates secure your site with HTTPS, protecting data and boosting trust. Appwrite renews
    your SSL certificates automatically.
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
