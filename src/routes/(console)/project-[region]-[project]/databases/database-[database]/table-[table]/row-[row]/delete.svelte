<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Confirm, Trim } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Alert, Layout, Selector, Table } from '@appwrite.io/pink-svelte';
    import { attributes, collection } from '../store';
    import { isRelationship, isRelationshipToMany } from './columns/store';
    import type { Models } from '@appwrite.io/console';

    export let showDelete = false;
    const databaseId = page.params.database;
    let checked = false;

    const handleDelete = async () => {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .databases.deleteDocument(databaseId, page.params.table, page.params.row);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `Row has been deleted`
            });
            trackEvent(Submit.DocumentDelete);
            await goto(
                `${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/table-${page.params.table}`
            );
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DocumentDelete);
        }
    };

    enum Deletion {
        'setNull' = 'Set row ID as NULL in all related rows',
        'cascade' = 'All related rows will be deleted',
        'restrict' = 'Row cannot be deleted'
    }

    $: relAttributes = $attributes?.filter(
        (attribute) =>
            isRelationship(attribute) &&
            // One-to-One are always included
            (attribute.relationType === 'oneToOne' ||
                // One-to-Many: Only if parent is deleted
                (attribute.relationType === 'oneToMany' && attribute.side === 'parent') ||
                // Many-to-One: Only include if child is deleted
                (attribute.relationType === 'manyToOne' && attribute.side === 'child') ||
                // Many-to-Many: Only include if the parent is being deleted
                (isRelationshipToMany(attribute) && attribute.side === 'parent'))
    ) as Models.AttributeRelationship[];
</script>

<Confirm title="Delete row" onSubmit={handleDelete} bind:open={showDelete}>
    <p data-private>
        Are you sure you want to delete <b
            >the row from <span data-private>{$collection.name}</span></b
        >?
    </p>

    {#if relAttributes?.length}
        <p class="text">This row contains the following relationships:</p>
        <Table.Root
            let:root
            columns={[
                { id: 'relations', width: 70 },
                { id: 'setting', width: 70 },
                { id: 'desc' }
            ]}>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="relations" {root}>Relation</Table.Header.Cell>
                <Table.Header.Cell column="setting" {root}>Setting</Table.Header.Cell>
                <Table.Header.Cell column="desc" {root} />
            </svelte:fragment>
            {#each relAttributes as attr}
                <Table.Row.Base {root}>
                    <Table.Cell column="relations" {root}>
                        <span class="u-flex u-cross-center u-gap-8">
                            {#if attr.twoWay}
                                <span class="icon-switch-horizontal"></span>
                            {:else}
                                <span class="icon-arrow-sm-right"></span>
                            {/if}
                            <Trim>{attr.key}</Trim>
                        </span>
                    </Table.Cell>
                    <Table.Cell column="setting" {root}>
                        {attr.onDelete}
                    </Table.Cell>
                    <Table.Cell column="desc" {root}>
                        {Deletion[attr.onDelete]}
                    </Table.Cell>
                </Table.Row.Base>
            {/each}
        </Table.Root>
        <Layout.Stack gap="l">
            <Alert.Inline
                title="To change these deletion behaviors edit the relationship settings." />

            <Selector.Checkbox
                id="delete"
                label={`Delete document from ${$collection.name}`}
                bind:checked />
        </Layout.Stack>
    {/if}

    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button danger submit disabled={relAttributes?.length && !checked}>Delete</Button>
    </svelte:fragment>
</Confirm>
