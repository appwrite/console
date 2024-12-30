<script lang="ts">
    import { tooltip as tooltipAction } from '$lib/actions/tooltip';
    import { Layout, Selector, Tooltip } from '@appwrite.io/pink-svelte';
    import { Helper } from '.';

    export let type: 'checkbox' | 'switchbox' = 'checkbox';
    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let value = false;
    export let required = false;
    export let disabled = false;
    export let tooltip: string = null;
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

<label class="choice-item" for={id}>
    <Layout.Stack direction="row" alignItems="flex-start">
        {#if type === 'switchbox'}
            <Selector.Switch
                {id}
                {disabled}
                {required}
                bind:value
                bind:checked={value}
                on:change
                on:invalid={handleInvalid} />
        {:else}
            <Selector.Checkbox
                {id}
                {disabled}
                size="s"
                {required}
                bind:value
                bind:checked={value}
                on:invalid={handleInvalid}
                on:change />
        {/if}

        <div class="choice-item-content" class:u-width-full-line={fullWidth}>
            {#if (label && showLabel) || tooltip}
                <div class="u-flex u-gap-4">
                    {#if label}
                        <span class:u-hide={!showLabel} class="choice-item-title">
                            {label}
                        </span>
                    {/if}
                    {#if tooltip}
                        <Tooltip>
                            <button type="button" class="tooltip" aria-label="variables info">
                                <span
                                    class="icon-info"
                                    aria-hidden="true"
                                    style="font-size: var(--icon-size-small)" />
                            </button>
                            <p slot="tooltip">{tooltip}</p>
                        </Tooltip>
                    {/if}
                </div>
            {/if}
            {#if $$slots.default}
                <p class="choice-item-paragraph"><slot /></p>
            {/if}
        </div>
    </Layout.Stack>
</label>
{#if error}
    <Helper type="warning">{error}</Helper>
{/if}
