<script lang="ts">
    import { onMount } from 'svelte';
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
        helper={error}
        on:change={(event) => (value = event.target.value)}
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
