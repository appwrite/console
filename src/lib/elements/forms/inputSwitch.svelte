<script lang="ts">
    import { FormItem, Helper } from '.';
    import { Selector } from '@appwrite.io/pink-svelte';

    export let label: string;
    export let id: string;
    export let value = false;
    export let disabled = false;

    let element: HTMLInputElement;
    let error: string;

    const handleInvalid = (event: Event) => {
        event.preventDefault();

        error = element.validationMessage;
    };

    $: if (value) {
        error = null;
    }
</script>

<FormItem>
    <label class="choice-item" for={id}>
        <div class="input-text-wrapper">
            <Selector.Switch {disabled} bind:checked={value} on:invalid={handleInvalid} />
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
