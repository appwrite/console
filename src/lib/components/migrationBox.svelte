<script lang="ts" context="module">
    import { page } from '$app/state';
    import { parseIfString } from '$lib/helpers/object';
    import { getProjectId } from '$lib/helpers/project';
    import { realtime } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    export const showMigrationBox = writable(false);
</script>

<script lang="ts">
    import { Modal, Code } from '$lib/components';
    let migration: Models.Migration;
    type Counter = {
        pending: number;
        error: number;
        success: number;
        processing: number;
        skip: number;
        warning: number;
    };

    type TotalCounter = {
        done: number;
        processing: number;
    };

    $: percentage = (function getPercentage() {
        if (!migration) return 0;
        if (migration.status === 'failed') return 100;
        if (migration.status === 'completed') return 100;

        const statusCounters = parseIfString(migration.statusCounters) as Record<string, Counter>;
        const totalCounter: TotalCounter = Object.values(statusCounters).reduce(
            (curr, acc) => {
                return {
                    done: curr.done + acc.success + acc.error + acc.skip + acc.warning,
                    processing: curr.processing + acc.processing + acc.pending
                };
            },
            { done: 0, processing: 0 } as TotalCounter
        );

        const res = Math.round(
            (totalCounter.done / (totalCounter.done + totalCounter.processing)) * 100
        );

        return Number.isNaN(res) ? 0 : res;
    })();

    onMount(() => {
        return realtime
            .forProject(page.params.region, page.params.project)
            .subscribe<Models.Migration>(['console'], async (response) => {
                if (!response.channels.includes(`projects.${getProjectId()}`)) return;
                if (response.events.includes('migrations.*')) {
                    if (response.payload.source === 'Backup') return;
                    migration = response.payload;
                }
            });
    });

    let showDetails = false;
    $: parsedErrors = (migration?.errors || []).map((e) => {
        try {
            return JSON.stringify(JSON.parse(e as unknown as string), null, 2);
        } catch {
            return typeof e === 'string' ? (e as string) : JSON.stringify(e, null, 2);
        }
    });
</script>

{#if $showMigrationBox && migration}
    <section class="upload-box">
        <header class="upload-box-header">
            <h4 class="upload-box-title">
                <span class="text">Importing Data</span>
            </h4>
            <button
                class="upload-box-button"
                aria-label="close migration box"
                on:click={() => ($showMigrationBox = false)}>
                <span class="icon-x" aria-hidden="true"></span>
            </button>
        </header>
        <div class="upload-box-content is-open">
            <section class="progress-bar u-padding-inline-16 u-padding-block-16">
                <div class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                    <span>{percentage}%</span>
                </div>
                <div
                    class="progress-bar-container"
                    class:is-danger={migration.status === 'failed'}
                    style="--graph-size:{percentage}%">
                </div>
                {#if migration.status === 'failed' && migration.errors?.length}
                    <div class="u-flex u-gap-8 u-cross-center u-padding-block-8">
                        <span
                            class="icon-exclamation-circle u-font-size-14"
                            aria-hidden="true"
                            style="color:hsl(var(--color-danger-100));"></span>
                        <span>
                            There was an import issue.
                            <button
                                type="button"
                                class="u-cursor-pointer u-underline"
                                on:click={() => (showDetails = true)}>
                                More details
                            </button>
                        </span>
                    </div>
                {/if}
            </section>
            <Modal title="Import error" bind:show={showDetails} hideFooter>
                <div style="max-inline-size: 524px" class="wrapped-code-block-for-multi-line">
                    <Code language="json" code={parsedErrors.join('\n\n')} withCopy allowScroll />
                </div>
            </Modal>
        </div>
    </section>
{/if}

<style>
    .upload-box-title {
        font-size: 11px;
    }

    .upload-box-content {
        min-width: 400px;
        max-width: 100vw;
    }

    .upload-box-button {
        display: flex;
        align-items: center;
        justify-content: center;
    }
</style>
