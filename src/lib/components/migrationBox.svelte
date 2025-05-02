<script lang="ts" context="module">
    import { page } from '$app/stores';
    import { parseIfString } from '$lib/helpers/object';
    import { getProjectId } from '$lib/helpers/project';
    import { realtime } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    export const showMigrationBox = writable(false);
</script>

<script lang="ts">
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
            .forProject($page.params.region, $page.params.project)
            .subscribe<Models.Migration>(['console'], async (response) => {
                if (!response.channels.includes(`projects.${getProjectId()}`)) return;
                if (response.events.includes('migrations.*')) {
                    if (response.payload.source === 'Backup') return;
                    migration = response.payload;
                }
            });
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
            </section>
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
