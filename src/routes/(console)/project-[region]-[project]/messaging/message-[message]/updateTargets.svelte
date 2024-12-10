<script lang="ts">
    import { MessagingProviderType, type Models } from '@appwrite.io/console';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { CardGrid, Heading, Empty, PaginationInline, EmptySearch } from '$lib/components';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { trackEvent, Submit, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { Button, Form } from '$lib/elements/forms';
    import UserTargetsModal from '../userTargetsModal.svelte';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { page } from '$app/stores';

    export let message: Models.Message & { data: Record<string, unknown> };
    export let selectedTargetsById: Record<string, Models.Target>;

    let providerType: MessagingProviderType;
    let offset = 0;
    const limit = 10;
    let showTargets = false;
    let targetsById: Record<string, Models.Target>;
    let targetIds: string[] = [];
    let targets: Models.Target[] = [];
    let disabled = true;

    if (isValueOfStringEnum(MessagingProviderType, message.providerType)) {
        providerType = message.providerType;
    }

    onMount(() => {
        targetsById = { ...selectedTargetsById };
    });

    function removeTarget(targetId: string) {
        const { [targetId]: _, ...rest } = targetsById;
        targetsById = rest;
    }

    async function update() {
        try {
            if (message.providerType == MessagingProviderType.Email) {
                await sdk
                    .forProject($page.params.region, $page.params.project)
                    .messaging.updateEmail(message.$id, undefined, undefined, targetIds);
            } else if (message.providerType == MessagingProviderType.Sms) {
                await sdk
                    .forProject($page.params.region, $page.params.project)
                    .messaging.updateSms(message.$id, undefined, undefined, targetIds);
            } else if (message.providerType == MessagingProviderType.Push) {
                await sdk
                    .forProject($page.params.region, $page.params.project)
                    .messaging.updatePush(message.$id, undefined, undefined, targetIds);
            }
            await invalidate(Dependencies.MESSAGING_MESSAGE);
            addNotification({
                message: 'Targets have been updated',
                type: 'success'
            });
            trackEvent(Submit.MessagingMessageUpdate);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.MessagingMessageUpdate);
        }
    }

    $: {
        targetIds = [];
        targets = [];
        for (const targetId in targetsById) {
            targetIds.push(targetId);
            targets.push(targetsById[targetId]);
        }
    }

    $: disabled = symmetricDifference(targetIds, Object.keys(selectedTargetsById)).length === 0;
</script>

<Form onSubmit={update}>
    <CardGrid hideFooter={message.status != 'draft'}>
        <Heading tag="h6" size="7" id="variables">Targets</Heading>
        <svelte:fragment slot="aside">
            {@const sum = targetIds.length}
            {#if sum}
                <div class="u-flex u-cross-center u-main-space-between">
                    <div>
                        <span class="eyebrow-heading-3">Target</span>
                    </div>
                    {#if message.status == 'draft'}
                        <Button
                            text
                            noMargin
                            on:click={() => {
                                showTargets = true;
                            }}>
                            <span class="icon-plus" aria-hidden="true" />
                            <span class="text">Add</span>
                        </Button>
                    {/if}
                </div>
                <div class="u-flex u-flex-vertical u-gap-24">
                    <Table noMargin noStyles>
                        <TableHeader>
                            <TableCellHead style="padding: 0" />
                            <TableCellHead width={40} style="padding: 0" />
                        </TableHeader>
                        <TableBody>
                            <TableRow />
                            {#each targets.slice(offset, offset + limit) as target (target.$id)}
                                <TableRow>
                                    <TableCell title="Target">
                                        <div class="u-flex u-cross-center">
                                            <span class="title">
                                                <span class="u-line-height-1-5">
                                                    <span class="body-text-2" data-private>
                                                        {#if target.providerType === MessagingProviderType.Push}
                                                            {target.name}
                                                        {:else}
                                                            {target.identifier}
                                                        {/if}
                                                    </span>
                                                </span></span>
                                        </div>
                                    </TableCell>
                                    <TableCell title="Remove">
                                        {#if message.status === 'draft'}
                                            <div
                                                class="u-flex u-main-end"
                                                style="--p-button-size: 1.25rem">
                                                <Button
                                                    text
                                                    class="is-only-icon"
                                                    ariaLabel="delete"
                                                    disabled={message.status != 'draft'}
                                                    on:click={() => removeTarget(target.$id)}>
                                                    <span
                                                        class="icon-x u-font-size-20"
                                                        aria-hidden="true" />
                                                </Button>
                                            </div>
                                        {/if}
                                    </TableCell>
                                </TableRow>
                            {/each}
                        </TableBody>
                    </Table>
                    <div class="u-flex u-main-space-between">
                        <p class="text">Total targets: {sum}</p>
                        <PaginationInline {sum} {limit} bind:offset />
                    </div>
                </div>
            {:else if message.status == 'draft'}
                <Empty on:click={() => (showTargets = true)}>Add a target</Empty>
            {:else}
                <EmptySearch hidePagination>
                    <div class="u-text-center">
                        No targets have been selected.
                        <p>
                            Need a hand? Check out our <Button
                                link
                                external
                                href="https://appwrite.io/docs/products/messaging/targets"
                                text>
                                documentation</Button
                            >.
                        </p>
                    </div>
                </EmptySearch>
            {/if}
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button {disabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

<UserTargetsModal
    title="Select targets"
    {providerType}
    bind:show={showTargets}
    {targetsById}
    on:update={(e) => {
        showTargets = false;
        targetsById = e.detail;
    }}>
    <svelte:fragment slot="description"
        >Select existing targets to which you want to send this message.</svelte:fragment>
</UserTargetsModal>
