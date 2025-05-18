<script lang="ts">
    import { DropList } from '$lib/components';
    import { SelectSearchCheckbox } from '..';
    import { Icon, Tag } from '@appwrite.io/pink-svelte';
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
        <div class="input">
            <div class="tags-container">
                {#each tags as tag}
                    <Tag size="xs">
                        {tag}
                    </Tag>
                {/each}
            </div>

            {#if !tags.length}
                <input {placeholder} bind:value={search} bind:this={input} />
            {/if}

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

<style lang="scss">
    .tags-input {
        width: 100%;

        @media (max-width: 768px) {
            padding-right: 2rem;
        }
    }

    .input {
        width: 100%;
        display: flex;
        align-items: center;
        transition: all 0.15s ease-in-out;
        padding-inline: var(--space-6);
        border-radius: var(--border-radius-s);
        background-color: var(--p-input-background-color);
        outline-offset: calc(var(--border-width-s) * -1);
        border: var(--border-width-s) solid var(--border-neutral);
        --p-input-background-color: var(--input-background-color, var(--bgcolor-neutral-default));

        & input {
            inline-size: 100%;
            padding-block: var(--space-3);
            padding-inline: 0;
            border: none;
            display: block;
            line-height: 140%;
            background: none;
        }

        & input::placeholder {
            color: var(--fgcolor-neutral-tertiary);
        }

        &:focus-within {
            outline: var(--border-width-l) solid var(--border-focus);
        }
    }
    .tags-container {
        flex: 1;
        display: flex;
        flex-wrap: wrap;
        overflow-y: auto;
        max-height: 14rem;
        gap: var(--space-2);
        align-items: center;
        align-content: space-between;
        padding-block: var(--space-2);
    }
</style>
