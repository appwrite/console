<script lang="ts">
    import { IconX, IconSearch } from '@appwrite.io/pink-icons-svelte';
    import { Input, Icon } from '@appwrite.io/pink-svelte';
    import { createEventDispatcher } from 'svelte';
    import { onDestroy } from 'svelte';

    export let value = '';
    export let placeholder = '';
    export let debounce = 250;
    export let required = false;
    export let disabled = false;
    export let autofocus = false;
    export let label: string = '';

    const dispatch = createEventDispatcher();
    let element: HTMLInputElement;
    let timer: ReturnType<typeof setTimeout>;

    onDestroy(() => {
        value = '';
        if (timer) {
            clearTimeout(timer);
        }
    });

    const valueChange = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            dispatch('change', value);
        }, debounce);
    };

    function clearSearch() {
        value = '';
        dispatch('clear');
    }

    $: if (!value) {
        if (element) {
            element.value = value;
        }
    }
</script>

<Input.Text
    {placeholder}
    {disabled}
    {required}
    {autofocus}
    {label}
    bind:value
    on:input={valueChange}>
    <svelte:fragment slot="start">
        <Icon icon={IconSearch} />
    </svelte:fragment>
    <svelte:fragment slot="end">
        {#if value}
            <Input.Action icon={IconX} on:click={clearSearch} />
        {/if}
    </svelte:fragment>
</Input.Text>
