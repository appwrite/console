<script lang="ts">
    import { DropList } from '$lib/components';
    import { SelectSearchCheckbox } from '..';

    type Option = {
        value: string;
        label: string;
        checked: boolean;
    };

    export let name: string;
    export let tags: string[] = [];
    export let placeholder: string;
    export let options: Option[] = [];

    let search = '';
    let input: HTMLInputElement;
    let show = false;

    function addValue(option: Option) {
        let tag = option.value.trim();
        if (tag.length === 0 || tags.includes(tag)) return;

        tags = [...tags, tag];
        option.checked = true;
        clearSearch();
    }

    function removeValue(option: Option) {
        tags = tags.filter((tag) => tag !== option.value);
        option.checked = false;
    }

    function clearSearch() {
        search = '';
        input.value = '';
    }

    $: filteredOptions = search
        ? options.filter((option) => option.label.toLowerCase().includes(search.toLowerCase()))
        : options;

    //TODO: Debounce search and open the droplist when the user starts typing
</script>

<DropList bind:show noStyle noArrow scrollable placement="bottom-end" fixed noMaxWidthList>
    <button
        class="tags-input u-position-relative u-cursor-pointer"
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

        <input
            class="tags-input-text u-cursor-text"
            {placeholder}
            bind:value={search}
            bind:this={input}
        />
        <span
            class:icon-cheveron-up={show}
            class:icon-cheveron-down={!show}
            class="chevron-icon u-position-absolute u-inset-inline-end-12"
            aria-hidden="true"></span>
    </button>

    <svelte:fragment slot="list">
        {#each filteredOptions as option (option.value + option.checked)}
            <SelectSearchCheckbox
                on:click={() => (option?.checked ? removeValue(option) : addValue(option))}
                bind:value={option.checked}>
                {option.label}
            </SelectSearchCheckbox>
        {:else}
            <li class="drop-list-item">
                <span class="text">There are no {name} that match your search</span>
            </li>
        {/each}
    </svelte:fragment>
</DropList>

<style>
    @media (max-width: 768px) {
        .chevron-icon {
            inset-block-start: 0.25rem !important;
        }

        .tags-input {
            padding-right: 2rem;
        }
    }
</style>
