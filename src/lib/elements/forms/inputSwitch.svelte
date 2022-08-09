<script lang="ts">
    import { FormItem, Helper } from '.';

    export let label: string;
    export let id: string;
    export let value = false;
    export let required = false;
    export let disabled = false;
    export let errorMessage = 'An error occurred';
    export let errorType: false | 'success' | 'warning' | 'error' = 'warning';
    export let showHelper = false;

    let element: HTMLInputElement;

    const handleInvalid = (event: Event) => {
        errorMessage = element.validationMessage;

        if (element.validity.valueMissing) {
            errorMessage = 'This field is required';
        }
        event.preventDefault();
        showHelper = true;
    };

    $: if (value) {
        showHelper = false;
    }
</script>

<FormItem>
    <label class="choice-item" for={id}>
        <div class="input-text-wrapper">
            <input
                on:invalid={handleInvalid}
                {id}
                {disabled}
                {required}
                type="checkbox"
                class="switch"
                role="switch"
                bind:this={element}
                bind:checked={value}
                on:change />
        </div>
        <div class="choice-item-content">
            <div class="choice-item-title">{label}</div>
        </div>
    </label>
    {#if showHelper}
        <Helper type={errorType}>{errorMessage}</Helper>
    {/if}
</FormItem>
