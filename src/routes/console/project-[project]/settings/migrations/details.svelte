<script lang="ts">
    import { Alert, Code, Modal, Tab } from '$lib/components';
    import Tabs from '$lib/components/tabs.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { parseIfString } from '$lib/helpers/object';
    import type { Models } from '@appwrite.io/console';

    export let migrations: Models.Migration[] = [];
    export let migrationId: string = null;

    $: details = migrations.find((migration) => migration.$id === migrationId);

    $: show = !!details;

    type StatusCounters = {
        [resource in 'Database' | 'Collection' | 'Function' | 'Users']?: StatusCounter;
    };
    type StatusCounter = {
        [statusType in 'pending' | 'success' | 'error' | 'skip' | 'processing' | 'warning']: number;
    };

    $: statusCounters = parseIfString(
        (details?.statusCounters as unknown as string) || '{}'
    ) as StatusCounters;

    const hasError = (counter: StatusCounter) => {
        if (!counter) return false;
        return counter.error > 0 || counter.warning > 0;
    };

    const isLoading = (counter: StatusCounter) => {
        if (!counter) return false;
        return counter.pending > 0 || counter.processing > 0;
    };

    const hasSucceeded = (counter: StatusCounter) => {
        if (!counter) return false;
        return counter.success > 0;
    };

    const totalItems = (counter: StatusCounter) => {
        if (!counter) return 0;
        return Object.values(counter).reduce((acc, curr) => acc + curr, 0);
    };

    let tab = 'details' as 'details' | 'logs';
</script>

<Modal bind:show on:close={() => (migrationId = null)} size="big">
    <svelte:fragment slot="header">
        {#if details.status === 'failed'}
            Resolve migration issues
        {:else}
            Migration details
        {/if}
    </svelte:fragment>
    <Tabs>
        <Tab selected={tab === 'details'} on:click={() => (tab = 'details')}>Details</Tab>
        <Tab selected={tab === 'logs'} on:click={() => (tab = 'logs')}>Logs</Tab>
    </Tabs>

    {#if tab === 'logs'}
        <Code code={JSON.stringify(details, null, 2)} language="json" allowScroll />
    {:else if tab === 'details'}
        <div class="box meta">
            <span>Date</span>
            <span>{toLocaleDateTime(details.$createdAt)}</span>
            <span>Source</span>
            <span>{details.source}</span>
        </div>

        {#if Object.values(statusCounters).some(hasError)}
            <Alert
                type="error"
                buttons={[
                    {
                        name: 'View logs',
                        method() {
                            tab = 'logs';
                        }
                    }
                ]}>
                There was an error migrating some of the project's entities.
            </Alert>
        {/if}

        {#if Object.keys(statusCounters).length}
            <div class="box">
                {#each Object.keys(statusCounters) as entity}
                    {@const entityCounter = statusCounters[entity]}
                    <div class="u-flex u-cross-center u-gap-16">
                        <div class="icon-wrapper">
                            {#if hasError(entityCounter)}
                                <i class="icon-exclamation" />
                            {:else if isLoading(entityCounter)}
                                <div class="u-flex">
                                    <span class="loader" />
                                </div>
                            {:else if hasSucceeded(entityCounter)}
                                <i class="icon-check" />
                            {:else}
                                <i class="icon-clock" />
                            {/if}
                        </div>

                        <div>
                            <span class="u-capitalize">{entity + 's'}</span>
                            <span class="inline-tag">{totalItems(entityCounter)}</span>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    {/if}
</Modal>

<style lang="scss">
    .box {
        padding: 0;

        > div {
            padding: 1.25rem;

            &:not(:last-child) {
                border-bottom: 1px solid hsl(var(--color-border));
            }
        }
    }

    .meta {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        padding: 1.5rem;

        :nth-child(2n) {
            font-weight: 600;
        }
    }

    .icon-wrapper {
        position: relative;

        width: 1.5rem;
        height: 1.5rem;

        > * {
            position: absolute;
            top: 50%;
            left: 50%;

            transform: translate(-50%, -50%);
        }
    }

    .icon-exclamation {
        color: hsl(var(--color-danger-100));
    }
</style>
