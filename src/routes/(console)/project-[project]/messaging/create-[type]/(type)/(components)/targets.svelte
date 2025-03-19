<script lang="ts">
    import Card from '$lib/components/card.svelte';
    import { MessagingProviderType, type Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import Actions from '../../../actions.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { Icon, Layout, Table } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    export let type: MessagingProviderType;
    export let topics: Models.Message['topics'];
    export let targets: Models.Message['targets'];

    let showTopics = false;
    let showUserTargets = false;

    const topicsById = writable<Record<string, Models.Topic>>({});
    const targetsById = writable<Record<string, Models.Target>>({});

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

    function getTotal(topic: Models.Topic): number {
        switch (type) {
            case MessagingProviderType.Email:
                return topic.emailTotal;
            case MessagingProviderType.Sms:
                return topic.smsTotal;
            case MessagingProviderType.Push:
                return topic.pushTotal;
            default:
                return 0;
        }
    }

    $: hasTopics = Object.keys($topicsById).length > 0;
    $: hasTargets = Object.keys($targetsById).length > 0;
    $: topics = Object.keys($topicsById);
    $: targets = Object.keys($targetsById);
</script>

{#if !hasTargets && !hasTopics}
    <Card>
        <div class="u-flex u-cross-center u-flex-vertical u-main-center u-flex">
            <Actions
                providerType={type}
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
    <Layout.Stack>
        <Table.Root columns={[{ id: 'target' }, { id: 'actions', width: 40 }]} let:root>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="target" {root}>Target</Table.Header.Cell>
                <Table.Header.Cell column="actions" {root} />
            </svelte:fragment>
            {#each Object.entries($topicsById) as [topicId, topic] (topicId)}
                <Table.Row.Base {root}>
                    <Table.Cell column="target" {root}>
                        {topic.name}
                        ({getTotal(topic)} targets)
                    </Table.Cell>
                    <Table.Cell column="actions" {root}>
                        <div class="u-flex u-main-end">
                            <button
                                class="button is-text is-only-icon"
                                type="button"
                                aria-label="delete"
                                on:click={() => removeTopic(topicId)}>
                                <span class="icon-x u-font-size-20" aria-hidden="true" />
                            </button>
                        </div>
                    </Table.Cell>
                </Table.Row.Base>
            {/each}
            {#each Object.entries($targetsById) as [targetId, target] (targetId)}
                <Table.Row.Base {root}>
                    <Table.Cell column="target" {root}>
                        {target.name ? target.name : target.identifier}
                    </Table.Cell>

                    <Table.Cell column="actions" {root}>
                        <div class="u-flex u-main-end">
                            <button
                                class="button is-text is-only-icon"
                                type="button"
                                aria-label="delete"
                                on:click={() => removeTarget(targetId)}>
                                <span class="icon-x u-font-size-20" aria-hidden="true" />
                            </button>
                        </div>
                    </Table.Cell>
                </Table.Row.Base>
            {/each}
        </Table.Root>
        <div>
            <Actions
                providerType={type}
                bind:showUserTargets
                bind:showTopics
                on:addTargets={addTargets}
                on:addTopics={addTopics}
                let:toggle>
                <Button secondary on:click={toggle}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Add
                </Button>
            </Actions>
        </div>
    </Layout.Stack>
{/if}
