<script lang="ts">
    import { type ComponentType, onMount } from 'svelte';
    import { Input, Layout, Selector } from '@appwrite.io/pink-svelte';

    export let id: string;
    export let label: string = '';
    export let value: string | null;
    export let required = false;
    export let nullable = false;
    export let disabled = false;
    export let readonly = false;
    export let autofocus = false;
    export let autocomplete = false;
    export let step: number | 'any' = 0.001;
    export let type: 'date' | 'time' | 'datetime-local' = 'date';
    export let leadingIcon: ComponentType | undefined = undefined;

    let error: string;
    let element: HTMLInputElement;
    let previousValue: string | null = null;

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    function handleNullChange(e: CustomEvent<boolean>) {
        const isNull = e.detail;

        if (isNull) {
            if (value !== null) {
                previousValue = value;
            }
            value = null;
        } else {
            value = previousValue;
        }
    }

    $: if (value) {
        error = null;
    }

    $: isValueNull = value === null;
</script>

<Layout.Stack gap="s" direction="row">
    <Input.DateTime
        {id}
        {label}
        {disabled}
        {readonly}
        {required}
        bind:value
        {step}
        {type}
        helper={error}
        {leadingIcon}
        autocomplete={autocomplete ? 'on' : 'off'}>
        <svelte:fragment slot="end">
            {#if nullable}
                <Selector.Checkbox
                    size="s"
                    label="NULL"
                    checked={isValueNull}
                    on:change={handleNullChange} />
            {/if}
        </svelte:fragment>
    </Input.DateTime>
</Layout.Stack>
