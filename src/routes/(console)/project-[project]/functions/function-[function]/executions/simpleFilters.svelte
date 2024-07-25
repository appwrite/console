<script lang="ts">
    import { DropList } from '$lib/components';
    import {
        addFilter,
        queries,
        tagFormat,
        tags,
        ValidOperators
    } from '$lib/components/filters/store';
    import { Pill, SelectSearchCheckbox } from '$lib/elements';
    import type { Column } from '$lib/helpers/types';
    import { type Writable } from 'svelte/store';

    export let columns: Writable<Column[]>;

    const colStatus = $columns.find((col) => col.id === 'status');
    let showStatusFilter = false;
    let statusTag: string = null;
    let statusOptions = colStatus?.elements?.map((element) => {
        return {
            value: (element?.value ?? element) as string,
            label: (element?.label ?? element) as string,
            checked: false
        };
    });

    tags.subscribe((tagList) => {
        if (!tagList?.length) {
            statusTag = null;
        } else {
            const list = [...tagList].reverse();
            list.forEach((tag) => {
                if (typeof tag === 'string') {
                    // Status
                    if (tag.includes(`**${colStatus.title}**`)) {
                        statusTag = tag;
                        statusOptions.forEach((option) => {
                            option.checked = tag.toLowerCase().includes(option.value);
                        });
                    }
                } else if (typeof tag !== 'string') {
                    // Status
                    if (tag.tag.includes(`**${colStatus.title}**`)) {
                        statusTag = tag.tag;
                        if (Array.isArray(tag.value) && tag.value?.length) {
                            const values = tag.value as string[];
                            statusOptions.forEach((option) => {
                                option.checked = values.includes(option.value);
                            });
                        }
                    }
                } else {
                    statusTag = null;
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
        const tagsList = $tags.filter((tag) =>
            typeof tag === 'string'
                ? tag.toLowerCase().includes(colId)
                : tag.tag.toLowerCase().includes(colId)
        );
        tagsList.forEach((tag) => queries.removeFilter(tag));
        if (value || arrayValues?.length) {
            addFilter($columns, colId, operator, value, arrayValues);
        }
        queries.apply();
    }

    $: multipleStatusQueries = [...$queries.values()].reduce((acc, query) => {
        if (query.includes(`"attribute":"${colStatus.id}"`)) {
            acc++;
        }
        return acc;
    }, 0);
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
                {colStatus.title}
            </span>
        {/if}
        <span
            class:icon-cheveron-down={!showStatusFilter}
            class:icon-cheveron-up={showStatusFilter}>
        </span>
    </Pill>
    <svelte:fragment slot="list">
        {#if multipleStatusQueries > 1}
            <li class="u-padding-inline-12">This will override your previous query.</li>
        {/if}
        {#each statusOptions as option (option.value + option.checked)}
            <SelectSearchCheckbox
                bind:value={option.checked}
                on:click={() => {
                    option.checked = !option.checked;
                    statusOptions = statusOptions;
                    addFilterAndApply(
                        colStatus.id,
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
