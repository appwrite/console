<script lang="ts">
    import { DropList } from '$lib/components';

    export let name: string;
    export let search = '';
    export let tags: string[] = [];
    export let placeholder: string;
    export let options: { value: string | boolean | number; label: string }[] = [];

    let show = false;

    $: filteredOptions = search
        ? options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()))
        : options;
</script>

<DropList bind:show noStyle noArrow scrollable placement="bottom-end" position="static" fixed>
    <button
        class="tags-input u-position-relative u-padding-inline-end-40 u-cursor-pointer"
        type="button"
        on:click={() => (show = !show)}>
        <div class="tags">
            <ul class="tags-list">
                {#each tags as tag}
                    <li class="tags-item">
                        <div class="input-tag">
                            <span class="tag-text">{tag}</span>
                        </div>
                    </li>
                {/each}
            </ul>
        </div>

        <input class="tags-input-text u-cursor-text" {placeholder} />
        <span
            class="icon-cheveron-down u-position-absolute u-inset-block-start-4 u-inset-inline-end-12"
            aria-hidden="true"></span>
    </button>

    <svelte:fragment slot="list">
        {#each filteredOptions as option}
            <slot {option} />
        {:else}
            <li class="drop-list-item">
                <span class="text">There are no {name} that match your search</span>
            </li>
        {/each}
    </svelte:fragment>
</DropList>
