<script lang="ts">
    import { FormItem, Helper } from '.';

    export let type: 'checkbox' | 'switchbox' = 'checkbox';
    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value = false;
    export let required = false;
    export let disabled = false;
    export let tooltip: string = null;

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
            <div class:u-hide={!showLabel} class="choice-item-title">
                <div class="u-flex u-cross-child-center u-gap-4">
                    <span>
                        {label}
                    </span>

                    {#if tooltip}
                        <button class="tooltip" aria-label="variables info">
                            <span class="icon-info" aria-hidden="true" />
                            <span class="tooltip-popup" role="tooltip">
                                <p class="text">
                                    {tooltip}
                                </p>
                            </span>
                        </button>
                    {/if}
                </div>
            </div>
            {#if $$slots}
                <p class="choice-item-paragraph"><slot /></p>
            {/if}
        </div>
    </label>
    {#if error}
        <Helper type="warning">{error}</Helper>
    {/if}
</FormItem>
