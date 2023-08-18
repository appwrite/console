<script lang="ts">
    import { FormItem, Helper } from '.';

    export let type: 'checkbox' | 'switchbox' = 'checkbox';
    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value = false;
    export let required = false;
    export let disabled = false;

    let element: HTMLInputElement;
    let error: string;

    const handleInvalid = (event: Event) => {
        event.preventDefault();
        if (element.validity.valueMissing) {
            error = 'This field is required';
            return;
        }
        error = element.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<FormItem>
    <label class="choice-item" for={id}>
        <input
            {id}
            {disabled}
            {required}
            type="checkbox"
            class:switch={type === 'switchbox'}
            bind:this={element}
            bind:checked={value}
            on:invalid={handleInvalid} />

        <div class="choice-item-content">
            <div class:u-hide={!showLabel} class="choice-item-title">{label}</div>
            {#if $$slots.default}
                <p class="choice-item-paragraph"><slot /></p>
            {/if}
        </div>
    </label>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
