<script lang="ts">
    import { Card } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { WizardStep } from '$lib/layout';
    import { messageParams, providerType, targetsById } from './store';
    import Actions from '../actions.svelte';
    import { topicsById, type Target, type Topic } from '../store';

    let showDropdown = false;
    let showTopics = false;
    let showUserTargets = false;
    let targetIdsLength = 0;
    let topicIdsLength = 0;

    function addTopics(event: CustomEvent<Record<string, Topic>>) {
        $topicsById = event.detail;
        showDropdown = false;
    }

    function removeTopic(topicId: string) {
        const { [topicId]: _, ...rest } = $topicsById;
        $topicsById = rest;
    }

    function addTargets(event: CustomEvent<Record<string, Target>>) {
        $targetsById = event.detail;
        showDropdown = false;
    }

    function removeTarget(targetId: string) {
        const { [targetId]: _, ...rest } = $targetsById;
        $targetsById = rest;
    }

    async function beforeSubmit() {
        $messageParams[$providerType].targets = Object.keys($targetsById);
        $messageParams[$providerType].topics = Object.keys($topicsById);
        console.log($messageParams[$providerType]);
    }

    $: topicIdsLength = Object.keys($topicsById).length;
    $: targetIdsLength = Object.keys($targetsById).length;
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Targets</svelte:fragment>
    <!-- TODO: add support for topics -->
    <svelte:fragment slot="subtitle"
        >Select users to whom this message should be directed.</svelte:fragment>
    {#if targetIdsLength === 0 && topicIdsLength === 0}
        <Card>
            <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                <Actions
                    providerType={$providerType}
                    bind:showDropdown
                    bind:showUserTargets
                    bind:showTopics
                    on:addTargets={addTargets}
                    on:addTopics={addTopics}>
                    <Button secondary round on:click={() => (showDropdown = !showDropdown)}>
                        <i class="icon-plus" />
                    </Button>
                </Actions>
                <div class="common-section">
                    <span class="text"> Select recipients to get started</span>
                </div>
            </div>
        </Card>
    {:else}
        <div class="table-wrapper">
            <Table noMargin noStyles>
                <TableHeader>
                    <TableCellHead width={140}>Target</TableCellHead>
                    <TableCellHead width={32} />
                </TableHeader>
                <TableBody>
                    {#each Object.entries($topicsById) as [topicId, topic] (topicId)}
                        <TableRow>
                            <TableCell title="Target">
                                <div class="u-flex u-cross-center">
                                    <span class="title"
                                        ><span class="u-line-height-1-5">
                                            <span class="body-text-2 u-bold" data-private>
                                                {topic.name}
                                            </span><span class="collapsible-button-optional"
                                                >({topic.total} subscribers)</span>
                                        </span></span>
                                </div>
                            </TableCell>
                            <TableCell title="Remove" width={40}>
                                <div class="u-flex u-main-end">
                                    <button
                                        class="button is-text is-only-icon"
                                        type="button"
                                        aria-label="delete"
                                        on:click={() => removeTopic(topicId)}>
                                        <span class="icon-x" aria-hidden="true" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    {/each}
                    {#each Object.entries($targetsById) as [targetId, target] (targetId)}
                        <TableRow>
                            <TableCell title="Target">
                                <div class="u-flex u-cross-center">
                                    <span class="text"
                                        >{target.name ? target.name : target.identifier}</span>
                                </div>
                            </TableCell>

                            <TableCell title="Remove" width={40}>
                                <div class="u-flex u-main-end">
                                    <button
                                        class="button is-text is-only-icon"
                                        type="button"
                                        aria-label="delete"
                                        on:click={() => removeTarget(targetId)}>
                                        <span class="icon-x" aria-hidden="true" />
                                    </button>
                                </div>
                            </TableCell>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
        </div>
        <Actions
            providerType={$providerType}
            bind:showDropdown
            bind:showUserTargets
            bind:showTopics
            on:addTargets={addTargets}
            on:addTopics={addTopics}>
            <Button text noMargin on:click={() => (showDropdown = !showDropdown)}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Add</span>
            </Button>
        </Actions>
    {/if}
</WizardStep>
