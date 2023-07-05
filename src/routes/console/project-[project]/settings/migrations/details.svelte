<script lang="ts">
    import { Modal } from '$lib/components';
    import type { Models } from '@appwrite.io/console';

    export let details: Models.Migration | null = null;
    $: show = !!details;

    type StatusCounters = {
        [resource in 'Database' | 'Collection' | 'Function' | 'Users']?: StatusCounter;
    };
    type StatusCounter = {
        [statusType in 'PENDING' | 'SUCCESS' | 'ERROR' | 'SKIP' | 'PROCESSING' | 'WARNING']: number;
    };

    $: statusCounters = JSON.parse(
        (details?.statusCounters as unknown as string) || '{}'
    ) as StatusCounters;

    const hasError = (counter: StatusCounter) => {
        if (!counter) return false;
        return counter.ERROR > 0 || counter.WARNING > 0;
    };

    const isLoading = (counter: StatusCounter) => {
        if (!counter) return false;
        return counter.PENDING > 0 || counter.PROCESSING > 0;
    };

    const hasSucceeded = (counter: StatusCounter) => {
        if (!counter) return false;
        return counter.SUCCESS > 0;
    };
</script>

<Modal bind:show on:close={() => (details = null)} size="big">
    <svelte:fragment slot="header">
        {#if details.status === 'failed'}
            Resolve import issues
        {:else}
            Migration details
        {/if}
    </svelte:fragment>
    {#if details}
        <div class="box">
            {#each ['Database', 'Collection', 'Function', 'Users'] as entity}
                <div class="u-flex u-cross-center u-gap-16">
                    <div class="icon-wrapper">
                        {#if hasError(statusCounters[entity])}
                            <i class="icon-exclamation" />
                        {:else if isLoading(statusCounters[entity])}
                            <span class="loader" />
                        {:else if hasSucceeded(statusCounters[entity])}
                            <i class="icon-check" />
                        {:else}
                            <i class="icon-question-mark-circle" />
                        {/if}
                    </div>

                    <div>
                        <span>{entity}</span>
                        <span class="inline-tag">2</span>
                    </div>
                </div>
            {/each}
        </div>
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
