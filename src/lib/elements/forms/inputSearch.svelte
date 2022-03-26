<script lang="ts">
    import { onMount } from 'svelte';

    export let value = '';
    export let placeholder = '';
    export let debounce = 250;
    export let required = false;
    export let disabled = false;
    export let autofocus = false;

    let element: HTMLInputElement;
    let timer: ReturnType<typeof setTimeout>;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    const onKeyUp = (event: KeyboardEvent) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const target = event.target as HTMLInputElement;
            value = target.value;
        }, debounce);
    };
</script>

<input
    {placeholder}
    {disabled}
    {required}
    type="search"
    class="input-text"
    on:keyup={onKeyUp}
    bind:this={element} />
