<script lang="ts">
    import { DropList } from '$lib/components';
    import { addFilter, queries, tags, ValidOperators } from '$lib/components/filters/store';
    import { Pill, SelectSearchCheckbox } from '$lib/elements';
    import type { Column } from '$lib/helpers/types';
    import { type Writable } from 'svelte/store';

    export let columns: Writable<Column[]>;
    let showStatusFilter = false;

    const colStatus = $columns.find((col) => col.id === 'status');
    let statusOptions = colStatus?.elements?.map((element) => {
        return {
            value: (element?.value ?? element) as string,
            label: (element?.label ?? element) as string,
            checked: false
        };
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
        console.log($queries);
    }
</script>

<DropList bind:show={showStatusFilter}>
    <Pill button on:click={() => (showStatusFilter = !showStatusFilter)}>
        <span class="text">{colStatus.title}</span>
        <span
            class:icon-cheveron-down={!showStatusFilter}
            class:icon-cheveron-up={showStatusFilter}>
        </span>
    </Pill>
    <svelte:fragment slot="list">
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
