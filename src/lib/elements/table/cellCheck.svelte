<script lang="ts">
    import { toggle } from '$lib/helpers/array';
    import { isHTMLInputElement } from '$lib/helpers/types';
    import { TableCell } from '.';
    import { InputCheckbox } from '../forms';

    export let id: string;
    export let selectedIds: string[] = [];
    let el: HTMLInputElement;

    const handleClick = (e: Event) => {
        // Prevent the link from being followed
        e.preventDefault();
        if (!isHTMLInputElement(el)) return;

        selectedIds = toggle(selectedIds, id);

        // Hack to make sure the checkbox is checked, independent of the
        // preventDefault() call above
        window.setTimeout(() => {
            el.checked = selectedIds.includes(id);
        });
    };
</script>

<TableCell class="u-position-relative">
    <div
        class="touch-area"
        role="button"
        tabindex="-1"
        on:click={handleClick}
        on:keypress={handleClick} />
    <InputCheckbox
        bind:element={el}
        id="select-{id}"
        wrapperTag="div"
        checked={selectedIds.includes(id)}
        on:click={handleClick} />
</TableCell>

<style lang="scss">
    .touch-area {
        position: absolute;
        inset: 0;
    }
</style>
