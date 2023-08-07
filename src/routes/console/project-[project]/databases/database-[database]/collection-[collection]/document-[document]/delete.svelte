<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Alert, Modal } from '$lib/components';
    import { Button, InputChoice } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { attributes, collection } from '../store';
    import { isRelationship } from './attributes/store';
    import type { Models } from '@appwrite.io/console';
    import LL from '$i18n/i18n-svelte';

    export let showDelete = false;
    const databaseId = $page.params.database;
    let checked = false;

    const handleDelete = async () => {
        try {
            await sdk.forProject.databases.deleteDocument(
                databaseId,
                $page.params.collection,
                $page.params.document
            );
            showDelete = false;
            addNotification({
                type: 'success',
                message: $LL.components.notification.documentDeleted()
            });
            trackEvent(Submit.DocumentDelete);
            await goto(
                `${base}/console/project-${$page.params.project}/databases/database-${$page.params.database}/collection-${$page.params.collection}`
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
        'setNull' = 'Set document ID as NULL in all related documents',
        'cascade' = 'All related documents will be deleted',
        'restrict' = 'Document can not be deleted'
    }

    $: relAttributes = $attributes?.filter((attribute) =>
        isRelationship(attribute)
    ) as Models.AttributeRelationship[];
</script>

<Modal
    icon="exclamation"
    state="warning"
    onSubmit={handleDelete}
    bind:show={showDelete}
    headerDivider={false}>
    <svelte:fragment slot="header">{$LL.console.project.title.deleteDocument()}</svelte:fragment>

    <p data-private>
        {$LL.console.project.texts.database.delete()}{' '}<b
            >{$LL.console.project.texts.database.docFrom()}{' '}<span data-private
                >{$collection.name}</span
            ></b
        >?
    </p>

    {#if relAttributes?.length}
        <TableScroll>
            <TableHeader>
                <TableCellHead width={50}
                    >{$LL.console.project.table.header.relation()}</TableCellHead>
                <TableCellHead width={50}
                    >{$LL.console.project.table.header.settings()}</TableCellHead>
                <TableCellHead width={200} />
            </TableHeader>
            <TableBody>
                {#each relAttributes as attr}
                    <TableRow>
                        <TableCell title="relation">
                            <span class="u-flex u-cross-center u-gap-8">
                                {#if attr.twoWay}
                                    <span class="icon-switch-horizontal" />
                                {:else}
                                    <span class="icon-arrow-sm-right" />
                                {/if}
                                <span data-private>{attr.key}</span>
                            </span>
                        </TableCell>
                        <TableCellText title="Settings">
                            {attr.onDelete}
                        </TableCellText>
                        <TableCellText title="description">
                            {Deletion[attr.onDelete]}
                        </TableCellText>
                    </TableRow>
                {/each}
            </TableBody>
        </TableScroll>
        <div class="u-flex u-flex-vertical u-gap-16">
            <Alert>{$LL.console.project.alert.databases.relationshipSettings()}</Alert>

            <InputChoice id="delete" label="Delete" showLabel={false} bind:value={checked}>
                {$LL.console.project.texts.databases.deleteDocFrom()}{' '}<span data-private
                    >{$collection.name}</span>
            </InputChoice>
        </div>
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}
            >{$LL.console.project.button.cancel()}</Button>
        <Button secondary submit disabled={relAttributes?.length && !checked}
            >{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</Modal>
