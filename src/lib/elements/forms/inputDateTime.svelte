<script lang="ts">
    import { type ComponentType, onMount } from 'svelte';
    import { Input, Layout, Selector } from '@appwrite.io/pink-svelte';

    export let id: string;
    export let label: string = '';
    export let value: string;
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

    onMount(() => {
        if (element && autofocus) {
            element.focus();
        }
    });

    let prevValue = '';
    function handleNullChange(e: CustomEvent<boolean>) {
        const isNull = e.detail;
        if (isNull) {
            prevValue = value;
            value = null;
        } else {
            value = prevValue;
        }
    }

    $: if (value) {
        error = null;
    }

    function onChange(event: CustomEvent) {
        value = (event.target as HTMLInputElement).value;
    }
</script>

<Layout.Stack gap="s" direction="row">
    <Input.DateTime
        {id}
        {label}
        {disabled}
        {readonly}
        {required}
        {value}
        {step}
        {type}
        helper={error}
        {leadingIcon}
        on:change={onChange}
        autocomplete={autocomplete ? 'on' : 'off'}>
        {#if nullable}
            <Selector.Checkbox
                size="s"
                slot="end"
                label="NULL"
                checked={value === null}
                on:change={handleNullChange} />
        {/if}
    </Input.DateTime>
</Layout.Stack>
