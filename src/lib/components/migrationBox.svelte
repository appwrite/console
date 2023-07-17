<script lang="ts" context="module">
    import { last } from '$lib/helpers/array';
    import { debounce } from '$lib/helpers/debounce';
    import { parseIfString } from '$lib/helpers/object';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    export const showMigrationBox = writable(true);
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

    const fetchMigrations = debounce(async () => {
        const { migrations } = await sdk.forProject.migrations.list();
        migration = last(migrations);
    }, 1000);

    fetchMigrations();

    onMount(async () => {
        return sdk.forConsole.client.subscribe(['project', 'console'], async (response) => {
            if (response.events.includes('migrations.*')) {
                fetchMigrations();
            }
        });
    });
</script>

{#if $showMigrationBox && migration}
    <section class="upload-box is-float">
        <header class="upload-box-header">
            <h4 class="upload-box-title">
                <span class="text">Importing Data</span>
            </h4>
            <button
                class="upload-box-button"
                aria-label="close migration box"
                on:click={() => ($showMigrationBox = false)}>
                <span class="icon-x" aria-hidden="true" />
            </button>
        </header>
        <div class="upload-box-content is-open">
            <section class="progress-bar">
                <div class="progress-bar-top-line u-flex u-gap-8 u-main-space-between">
                    <span>{percentage}%</span>
                </div>
                <div
                    class="progress-bar-container"
                    class:is-danger={migration.status === 'failed'}
                    style="--graph-size:{percentage}%" />
            </section>
        </div>
    </section>
{/if}

<style>
    .upload-box-content {
        padding: 1.5rem;
        min-width: 400px;
        max-width: 100vw;
    }
</style>
