<script lang="ts">
    import { toggle } from '$lib/helpers/array';
    import { isHTMLInputElement } from '$lib/helpers/types';
    import { TableCell } from '.';
    import { InputCheckbox } from '../forms';

    export let id: string;
    export let selectedIds: string[] = [];
</script>

<TableCell>
    <InputCheckbox
        id="select-{id}"
        value={selectedIds.includes(id)}
        on:click={(e) => {
            // Prevent the link from being followed
            e.preventDefault();
            const el = e.currentTarget;
            if (!isHTMLInputElement(el)) return;

            selectedIds = toggle(selectedIds, id);

            // Hack to make sure the checkbox is checked, independent of the
            // preventDefault() call above
            window.setTimeout(() => {
                el.checked = selectedIds.includes(id);
            });
        }} />
</TableCell>
