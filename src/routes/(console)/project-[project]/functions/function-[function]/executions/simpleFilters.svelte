<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { DropList } from '$lib/components';
    import {
        addFilter,
        queries,
        queryParamToMap,
        tagFormat,
        tags,
        ValidOperators,
        type TagValue
    } from '$lib/components/filters/store';
    import { Pill, SelectSearchCheckbox } from '$lib/elements';
    import type { Column } from '$lib/helpers/types';
    import { type Writable } from 'svelte/store';

    export let columns: Writable<Column[]>;

    const statusCol = $columns.find((col) => col.id === 'status');
    let showStatusFilter = false;
    let statusTag: string = null;
    let statusOptions = statusCol?.elements?.map((element) => {
        return {
            value: (element?.value ?? element) as string,
            label: (element?.label ?? element) as string,
            checked: false
        };
    });
    let statusQueriesTotal = 0;

    const triggerCol = $columns.find((col) => col.id === 'trigger');
    let showTriggerFilter = false;
    let triggerTag: string = null;
    let triggerOptions = triggerCol?.elements?.map((element) => {
        return {
            value: (element?.value ?? element) as string,
            label: (element?.label ?? element) as string,
            checked: false
        };
    });
    let triggerQueriesTotal = 0;

    let localQueries = new Map<TagValue, string>();
    afterNavigate((p) => {
        const paramQueries = p.to.url.searchParams.get('query');
        localQueries = queryParamToMap(paramQueries || '[]');
        const localTags = Array.from(localQueries.keys());
        //Set total
        statusQueriesTotal = [...localQueries.values()].reduce((acc, query) => {
            if (query.includes(`"attribute":"${statusCol.id}"`)) {
                acc++;
            }
            return acc;
        }, 0);
        triggerQueriesTotal = [...localQueries.values()].reduce((acc, query) => {
            if (query.includes(`"attribute":"${triggerCol.id}"`)) {
                acc++;
            }
            return acc;
        }, 0);
        // Set tags
        if (!localTags?.length) {
            statusTag = null;
            triggerTag = null;
        } else {
            const list = [...localTags].reverse();
            list.forEach((tagData) => {
                // STATUS
                if (tagData.tag.includes(`**${statusCol.title}**`)) {
                    statusTag = tagData.tag;
                    if (Array.isArray(tagData.value) && tagData.value?.length) {
                        const values = tagData.value as string[];
                        statusOptions.forEach((option) => {
                            option.checked = values.includes(option.value);
                        });
                    }
                }

                // TRIGGER
                if (tagData.tag.includes(`**${triggerCol.title}**`)) {
                    triggerTag = tagData.tag;
                    if (Array.isArray(tagData.value) && tagData.value?.length) {
                        const values = tagData.value as string[];
                        triggerOptions.forEach((option) => {
                            option.checked = values.includes(option.value);
                        });
                    }
                }
            });
        }
    });

    function addFilterAndApply(
        colId: string,
        operator: ValidOperators,
        value: unknown,
        arrayValues: string[] = []
    ) {
        const tagsList = $tags.filter((tag) => tag.tag.toLowerCase().includes(colId));
        tagsList.forEach((tag) => queries.removeFilter(tag));
        if (value || arrayValues?.length) {
            addFilter($columns, colId, operator, value, arrayValues);
        }
        queries.apply();
    }
</script>

<DropList bind:show={showStatusFilter} width="11">
    <Pill button on:click={() => (showStatusFilter = !showStatusFilter)}>
        {#if statusTag}
            {#key statusTag}
                <span use:tagFormat>
                    {statusTag}
                </span>
            {/key}
        {:else}
            <span class="text">
                {statusCol.title}
            </span>
        {/if}
        <span
            class:icon-cheveron-down={!showStatusFilter}
            class:icon-cheveron-up={showStatusFilter}>
        </span>
    </Pill>
    <svelte:fragment slot="list">
        {#if statusQueriesTotal > 1}
            <li class="u-padding-inline-12">This will override your previous query.</li>
        {/if}
        {#each statusOptions as option (option.value + option.checked)}
            <SelectSearchCheckbox
                bind:value={option.checked}
                on:click={() => {
                    option.checked = !option.checked;
                    statusOptions = statusOptions;
                    addFilterAndApply(
                        statusCol.id,
                        ValidOperators.Equal,
                        null,
                        statusOptions.filter((opt) => opt.checked).map((opt) => opt.value) ?? []
                    );
                }}>
                {option.label}
            </SelectSearchCheckbox>
        {/each}
    </svelte:fragment>
</DropList>
<DropList bind:show={showTriggerFilter} width="11">
    <Pill button on:click={() => (showTriggerFilter = !showTriggerFilter)}>
        {#if triggerTag}
            {#key triggerTag}
                <span use:tagFormat>
                    {triggerTag}
                </span>
            {/key}
        {:else}
            <span class="text">
                {triggerCol.title}
            </span>
        {/if}
        <span
            class:icon-cheveron-down={!showTriggerFilter}
            class:icon-cheveron-up={showTriggerFilter}>
        </span>
    </Pill>
    <svelte:fragment slot="list">
        {#if triggerQueriesTotal > 1}
            <li class="u-padding-inline-12">This will override your previous query.</li>
        {/if}
        {#each triggerOptions as option (option.value + option.checked)}
            <SelectSearchCheckbox
                bind:value={option.checked}
                on:click={() => {
                    option.checked = !option.checked;
                    triggerOptions = triggerOptions;
                    addFilterAndApply(
                        triggerCol.id,
                        ValidOperators.Equal,
                        null,
                        triggerOptions.filter((opt) => opt.checked).map((opt) => opt.value) ?? []
                    );
                }}>
                {option.label}
            </SelectSearchCheckbox>
        {/each}
    </svelte:fragment>
</DropList>
