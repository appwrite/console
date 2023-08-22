<script lang="ts">
    import { FormItem, Helper } from '.';

    export let label: string;
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
        <div class="input-text-wrapper">
            <input
                {id}
                {disabled}
                {required}
                type="checkbox"
                class="switch"
                role="switch"
                aria-checked={value}
                bind:this={element}
                bind:checked={value}
                on:change
                on:invalid={handleInvalid} />
        </div>
        <div class="choice-item-content">
            <div class="choice-item-title">{label}</div>
            <slot name="description" />
        </div>
    </label>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
