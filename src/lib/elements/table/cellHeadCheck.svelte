<script lang="ts">
    import { isHTMLInputElement } from '$lib/helpers/types';
    import { TableCellHead } from '.';
    import { InputCheckbox } from '../forms';

    export let selected: string[] = [];
    export let pageItemsIds: string[] = [];

    function handleClick(e: MouseEvent) {
        if (!isHTMLInputElement(e.target)) return;
        if (e.target.checked) {
            const set = new Set(selected);
            pageItemsIds.forEach((id) => set.add(id));
            selected = Array.from(set);
        } else {
            selected = selected.filter((id) => {
                return !pageItemsIds.includes(id);
            });
        }
    }

    $: someSelected = pageItemsIds.some((id) => selected.includes(id));
    $: allSelected = pageItemsIds.every((id) => selected.includes(id));
</script>

<TableCellHead width={10}>
    <InputCheckbox
        id="select-all"
        indeterminate={someSelected && !allSelected}
        checked={allSelected}
        on:click={handleClick} />
</TableCellHead>
