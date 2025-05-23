<script lang="ts">
    import { Card } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { WizardStep } from '$lib/layout';
    import { messageParams, providerType, targetsById, getTotal } from './store';
    import Actions from '../actions.svelte';
    import { topicsById } from '../store';
    import type { Models } from '@appwrite.io/console';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Table } from '@appwrite.io/pink-svelte';

    let showTopics = false;
    let showUserTargets = false;
    let targetIdsLength = 0;
    let topicIdsLength = 0;

    function addTopics(event: CustomEvent<Record<string, Models.Topic>>) {
        $topicsById = event.detail;
    }

    function removeTopic(topicId: string) {
        const { [topicId]: _, ...rest } = $topicsById;
        $topicsById = rest;
    }

    function addTargets(event: CustomEvent<Record<string, Models.Target>>) {
        $targetsById = event.detail;
    }

    function removeTarget(targetId: string) {
        const { [targetId]: _, ...rest } = $targetsById;
        $targetsById = rest;
    }

    async function beforeSubmit() {
        if (topicIdsLength === 0 && targetIdsLength === 0) {
            throw new Error('At least one topic or target is required.');
        }
    }

    $: topicIdsLength = Object.keys($topicsById).length;
    $: targetIdsLength = Object.keys($targetsById).length;
    $: $messageParams[$providerType].targets = Object.keys($targetsById);
    $: $messageParams[$providerType].topics = Object.keys($topicsById);
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Targets</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Select targets to whom this message should be directed.
    </svelte:fragment>
    {#if targetIdsLength === 0 && topicIdsLength === 0}
        <Card>
            <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
                <Actions
                    providerType={$providerType}
                    bind:showUserTargets
                    bind:showTopics
                    on:addTargets={addTargets}
                    on:addTopics={addTopics}
                    let:toggle>
                    <Button secondary icon on:click={toggle}>
                        <Icon icon={IconPlus} size="s" />
                    </Button>
                </Actions>
                <div class="common-section">
                    <span class="text"> Select targets to get started</span>
                </div>
            </div>
        </Card>
    {:else}
        <div class="table-wrapper">
            <Table.Root columns={[{ id: 'target' }, { id: 'actions', width: 40 }]} let:root>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell column="target" {root}>Target</Table.Header.Cell>
                    <Table.Header.Cell column="actions" {root} />
                </svelte:fragment>
                {#each Object.entries($topicsById) as [topicId, topic] (topicId)}
                    <Table.Row.Base {root}>
                        <Table.Cell column="target" {root}>
                            <div class="u-flex u-cross-center">
                                <span class="title">
                                    <span class="u-line-height-1-5">
                                        <span class="body-text-2 u-bold" data-private>
                                            {topic.name}
                                        </span>
                                        <span class="collapsible-button-optional">
                                            ({getTotal(topic)} targets)
                                        </span>
                                    </span></span>
                            </div>
                        </Table.Cell>
                        <Table.Cell column="actions" {root}>
                            <div class="u-flex u-main-end">
                                <button
                                    class="button is-text is-only-icon"
                                    type="button"
                                    aria-label="delete"
                                    on:click={() => removeTopic(topicId)}>
                                    <span class="icon-x u-font-size-20" aria-hidden="true"></span>
                                </button>
                            </div>
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
                {#each Object.entries($targetsById) as [targetId, target] (targetId)}
                    <Table.Row.Base {root}>
                        <Table.Cell column="target" {root}>
                            <div class="u-flex u-cross-center">
                                <span class="text">
                                    {target.name ? target.name : target.identifier}
                                </span>
                            </div>
                        </Table.Cell>
                        <Table.Cell column="actions" {root}>
                            <div class="u-flex u-main-end">
                                <button
                                    class="button is-text is-only-icon"
                                    type="button"
                                    aria-label="delete"
                                    on:click={() => removeTarget(targetId)}>
                                    <span class="icon-x u-font-size-20" aria-hidden="true"></span>
                                </button>
                            </div>
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>
        </div>
        <Actions
            providerType={$providerType}
            bind:showUserTargets
            bind:showTopics
            on:addTargets={addTargets}
            on:addTopics={addTopics}
            let:toggle>
            <Button text on:click={toggle}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add
            </Button>
        </Actions>
    {/if}
</WizardStep>
