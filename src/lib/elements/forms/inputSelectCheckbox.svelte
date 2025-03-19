<script lang="ts">
    import { DropList } from '$lib/components';
    import { SelectSearchCheckbox } from '..';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconChevronDown, IconChevronUp } from '@appwrite.io/pink-icons-svelte';

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

        <div class="input">
            <input {placeholder} bind:value={search} bind:this={input} />

            <Icon size="m" icon={show ? IconChevronUp : IconChevronDown} />
        </div>
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
    .tags-input {
        width: 100%;
    }

    @media (max-width: 768px) {
        .tags-input {
            padding-right: 2rem;
        }
    }

    .input {
        width: 100%;
        display: flex;
        align-items: center;
        transition: all 0.15s ease-in-out;
        border: var(--border-width-s) solid var(--border-neutral);
        border-radius: var(--border-radius-s);
        background-color: var(--p-input-background-color);
        padding-inline: var(--space-6);
        outline-offset: calc(var(--border-width-s) * -1);
        --p-input-background-color: var(--input-background-color, var(--bgcolor-neutral-default));
    }
    .input input {
        inline-size: 100%;
        padding-block: var(--space-3);
        padding-inline: 0;
        border: none;
        display: block;
        line-height: 140%;
        background: none;
    }
    .input input::placeholder {
        color: var(--fgcolor-neutral-tertiary);
    }
    .input:focus-within {
        outline: var(--border-width-l) solid var(--border-focus);
    }
</style>
