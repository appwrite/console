<script lang="ts">
    import { InputSelect } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { IconList } from '@appwrite.io/pink-icons-svelte';

    export let id: string;
    export let label: string;
    export let value: string;
    export let limited: boolean = false;
    export let column: Models.ColumnEnum;
    export let optionalText: string | undefined = undefined;

    $: baseOptions = column.elements.map((element) => ({
        label: element,
        value: element
    }));

    $: nullOption = !column.required ? [{ label: 'NULL', value: null }] : [];

    $: options = [...baseOptions, ...nullOption];

    $: if (limited) {
        label = undefined;
        optionalText = undefined;
    }

    const onChange = (event: CustomEvent) => {
        if (limited) {
            value = event.detail as string;
        }
    };
</script>

{#if limited}
    <InputSelect
        {id}
        {label}
        {value}
        {optionalText}
        {options}
        autofocus={limited}
        required={column.required}
        placeholder="Select a value"
        on:change={onChange} />
{:else}
    <InputSelect
        bind:value
        {options}
        {id}
        {label}
        {optionalText}
        autofocus={limited}
        required={column.required}
        placeholder="Select a value"
        leadingIcon={!limited ? IconList : undefined} />
{/if}
