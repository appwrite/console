<script lang="ts">
    import { DropList } from '$lib/components';

    export let tags: string[] = [];
    export let placeholder: string;
    export let options: { value: string | boolean | number; label: string }[] = [];

    let show = false;
</script>

<div class="tags-input u-position-relative u-padding-inline-end-40 u-cursor-pointer" type="button" on:click={}>
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
</div>

<div>
    {#each options as option, i}
        <li class="drop-list-item">
            test
            <!-- <button
                    class="drop-button"
                    class:is-selected={selected === i}
                    type="button"
                    on:click|preventDefault={() => {
                        selectOption(option);
                    }}>
                    <slot {option}>
                        <span class="text" data-private>{option.label}</span>
                    </slot>
                </button> -->
        </li>
    {:else}
        <li class="drop-list-item">
            <span class="text">There are no {name} that match your search</span>
        </li>
    {/each}
</div>
