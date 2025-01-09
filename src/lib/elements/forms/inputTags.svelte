<script lang="ts">
    import { last } from '$lib/helpers/array';
    import { onMount, SvelteComponent } from 'svelte';
    import { FormItem, Helper, Label } from '.';
    import { Drop } from '$lib/components';

    export let id: string;
    export let label: string;
    export let showLabel = true;
    export let tags: string[] = [];
    export let placeholder = '';
    export let autofocus = false;
    export let disabled = false;
    export let readonly = false;
    export let required = false;
    export let tooltip: string = null;
    export let validityRegex: RegExp = null;
    export let validityMessage: string = null;
    export let popover: typeof SvelteComponent<unknown> = null;
    export let popoverProps: Record<string, unknown> = {};

    let value = '';
    let element: HTMLInputElement;
    let hiddenEl: HTMLInputElement;
    let error: string;
    let show: boolean = false;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const handleInput = (e: KeyboardEvent) => {
        /**
         * Allow form submit and tab input switch
         */
        if (value === '' && ['Enter', 'Tab', ','].includes(e.key)) {
            return;
        }

        if (['Enter', 'Tab', ' ', ','].includes(e.key)) {
            e.preventDefault();
            if (validityRegex && !validityRegex.test(value)) {
                error = validityMessage ? validityMessage : 'Invalid value';
                return;
            }
            addValue();
        }
        if (['Backspace', 'Delete'].includes(e.key)) {
            if (value.length === 0) {
                removeValue(last(tags));
            }
        }
    };

    const addValue = () => {
        if (validityRegex && !validityRegex.test(value) && !!value) {
            error = validityMessage ? validityMessage : 'Invalid value';
            return;
        }
        let tag = value.trim();
        if (tag.length === 0 || tags.includes(tag)) return;

        tags = [...tags, tag];
        value = '';
    };

    const removeValue = (value: string) => {
        if (readonly) return;
        tags = tags.filter((tag) => tag !== value);
    };

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        if (hiddenEl.validity.valueMissing) {
            error = 'This field is required';
            return;
        }
        error = hiddenEl.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<FormItem>
    <input
        class="u-hide"
        bind:this={hiddenEl}
        value={tags.join(',')}
        {required}
        on:invalid={handleInvalid} />
    <Label {required} {tooltip} hide={!showLabel} for={id}>
        {label}{#if popover}
            <Drop isPopover bind:show display="inline-block">
                &nbsp;<button
                    type="button"
                    on:click={() => (show = !show)}
                    aria-label="input tooltip">
                    <span
                        class="icon-info"
                        aria-hidden="true"
                        style="font-size: var(--icon-size-small)" />
                </button>
                <svelte:fragment slot="list">
                    <div
                        class="dropped card u-max-width-250"
                        style:--card-border-radius="var(--border-radius-small)"
                        style:--p-card-padding=".75rem"
                        style:box-shadow="var(--shadow-large)">
                        <svelte:component this={popover} {...popoverProps} />
                    </div>
                </svelte:fragment>
            </Drop>
        {/if}
    </Label>

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
                {id}
                {placeholder}
                {disabled}
                {readonly}
                type="text"
                class="tags-input-text"
                bind:value
                bind:this={element}
                on:keydown={handleInput}
                on:blur={addValue} />
        </div>
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
