<script lang="ts">
    import { onMount } from 'svelte';
    import { FormItem, Helper } from '.';

    export let id: string;
    export let label: string;
    export let showLabel = true;
    export let tags: string[] = [];
    export let placeholder = '';
    export let autofocus = false;
    export let errorMessage = 'An error occurred';
    export let errorType: false | 'success' | 'warning' | 'error' = 'warning';
    export let showHelper = false;

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

    const handleInvalid = (event: Event) => {
        errorMessage = element.validationMessage;
        if (element.validity.valueMissing) {
            errorMessage = 'This field is required';
        }
        event.preventDefault();
        showHelper = true;
    };

    $: if (value) {
        showHelper = false;
    }
</script>

<FormItem>
    <label class:u-hide={!showLabel} class="label" for={id}>{label}</label>
    <div class="input-text-wrapper">
        <div class="tags-input">
            <div class="tags">
                <ul class="tags-list">
                    {#each tags as tag}
                        <li class="tags-item">
                            <div class="input-tag">
                                <span class="tag-text">{tag}</span>
                                <button
                                    type="button"
                                    class="input-tag-delete-button"
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
                on:invalid={handleInvalid}
                type="text"
                class="tags-input-text"
                {id}
                {placeholder}
                on:keydown={handleInput}
                on:blur={addValue}
                bind:value
                bind:this={element} />
        </div>
    </div>
    {#if showHelper}
        <Helper type={errorType}>{errorMessage}</Helper>
    {/if}
</FormItem>
