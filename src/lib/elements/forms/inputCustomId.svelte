<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { FormItem } from '.';

    export let id: string;
    export let label: string;
    export let value = '';
    export let placeholder = '';
    export let required = false;
    export let autofocus = false;

    let element: HTMLInputElement;
    let unique = true;
    let bench = '';

    const toggle = async () => {
        unique = !unique;
        if (unique) {
            bench = value;
            value = 'unique()';
        } else {
            value = bench;
            await tick();
            element.focus();
        }
    };

    onMount(() => {
        value = 'unique()';
        if (element && autofocus) {
            element.focus();
        }
    });
</script>

<FormItem>
    <label class="label" for={id}>{label}</label>
    <div class="input-text-wrapper is-with-end-button">
        <input
            {placeholder}
            {required}
            type="text"
            class="input-text"
            disabled={unique}
            bind:value
            bind:this={element} />
        <button class="input-button" aria-label="Switch" on:click={toggle} type="button">
            <span class:icon-edit={unique} class:icon-shuffle={!unique} aria-hidden="true" />
        </button>
    </div>
</FormItem>
