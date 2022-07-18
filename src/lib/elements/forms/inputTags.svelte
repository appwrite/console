<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem } from '.';

    export let id: string;
    export let label: string;
    export let showLabel = true;
    export let tags: string[] = [];
    export let placeholder = '';
    export let helper = '';
    export let autofocus = false;
    export let disabled = false;
    export let readonly = false;

    let value = '';
    let element: HTMLInputElement;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const handleInput = (e: KeyboardEvent) => {
        /**
         * Allow form submit and tab input switch
         */
        if (value === '' && ['Enter', 'Tab'].includes(e.key)) {
            return;
        }
        if (['Enter', 'Tab', ' '].includes(e.key)) {
            e.preventDefault();
            addValue();
        }
        if (['Backspace', 'Delete'].includes(e.key)) {
            if (value.length === 0) {
                removeValue(tags[tags.length - 1]);
            }
        }
    };

    const addValue = () => {
        let tag = value.trim();
        if (tag.length === 0 || tags.includes(tag)) return;

        tags = [...tags, tag];
        value = '';
    };

    const removeValue = (value: string) => {
        tags = tags.filter((tag) => tag !== value);
    };
</script>

<FormItem>
    <label class:u-hide={!showLabel} class="label" for={id}>{label}</label>
    <div class="input-text-wrapper">
        <div class="tags-input">
            <div class="tags">
                <ul class="tags-list">
                    {#each tags as tag}
                        <li class="tags-item">
                            <div class="tag">
                                <span class="tag-text">{tag}</span>
                                <button
                                    type="button"
                                    class="x-button"
                                    aria-label={`delete ${tag} tag`}
                                    on:click={() => removeValue(tag)}>
                                    <span class="icon-x" aria-hidden="true" />
                                </button>
                            </div>
                        </li>
                    {/each}
                </ul>
            </div>
            <input
                type="text"
                class="tags-input-text"
                {id}
                {placeholder}
                {disabled}
                {readonly}
                on:keydown={handleInput}
                on:blur={addValue}
                bind:value
                bind:this={element} />
        </div>
    </div>
    {#if helper}
        <p class="helper u-margin-block-start-12">{helper}</p>
    {/if}
</FormItem>
