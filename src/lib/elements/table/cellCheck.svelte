<script lang="ts">
    import { toggle } from '$lib/helpers/array';
    import { isHTMLInputElement } from '$lib/helpers/types';
    import { TableCellButton } from '.';
    import { InputCheckbox } from '../forms';

    export let id: string;
    export let selectedIds: string[] = [];
    export let disabled: boolean = false;
    let el: HTMLInputElement;

    const handleClick = (e: Event) => {
        // Prevent the link from being followed
        e.preventDefault();
        e.stopPropagation();
        if (!isHTMLInputElement(el)) return;

        selectedIds = toggle(selectedIds, id);

        // Hack to make sure the checkbox is checked, independent of the
        // preventDefault() call above
        window.setTimeout(() => {
            el.checked = selectedIds.includes(id);
        });
    };
</script>

<TableCellButton on:click={handleClick}>
    <InputCheckbox
        bind:element={el}
        id="select-{id}"
        checked={selectedIds.includes(id)}
        {disabled}
        on:click={handleClick} />
</TableCellButton>
