<script lang="ts">
    import { FormItem, Helper, Label } from '.';

    export let label: string = null;
    export let showLabel = true;
    // export let label: string;
    export let id: string;
    export let group: string;
    export let value: string;
    export let name: string;
    export let required = false;
    export let disabled = false;
    export let fullWidth = false;

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
    <div class="input-text-wrapper">
        <input
            {id}
            {name}
            {disabled}
            {required}
            {value}
            type="radio"
            bind:group
            bind:this={element}
            on:invalid={handleInvalid} />
        <Label {required} hide={!showLabel} for={id}>
            {#if label}
                {label}
            {:else}
                <slot />
            {/if}
        </Label>
        <!-- <label class="choice-item" for={id}>
            <input
                {id}
                {name}
                {disabled}
                {required}
                {value}
                type="radio"
                bind:group
                bind:this={element}
                on:invalid={handleInvalid} />
            <div
                class="choice-item-content u-cross-child-center"
                class:u-width-full-line={fullWidth}>
                <div class="choice-item-title">{label}</div>
                <slot name="description" />
            </div>
        </label> -->
    </div>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
