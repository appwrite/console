<script lang="ts">
    import { FormItem, Label } from '.';

    export let id: string;
    export let label: string;
    export let showLabel = true;
    export let value = '';
    export let placeholder = '';

    let showInPlainText = false;
</script>

<FormItem>
    <Label hide={!showLabel} for={id}>
        {label}
    </Label>

    <div class="input-text-wrapper" style=" --amount-of-buttons: 1;">
        {#if showInPlainText}
            <div
                contenteditable="true"
                role="textbox"
                {id}
                aria-placeholder={placeholder}
                class="input-text  is-resizable"
                bind:textContent={value} />
        {:else}
            <input
                {id}
                {placeholder}
                name={id}
                type="password"
                class="input-text"
                autocomplete="off"
                bind:value />
        {/if}
        <button
            type="button"
            on:click={() => (showInPlainText = !showInPlainText)}
            class="show-password-button"
            aria-label="show / hide password">
            <span
                class:icon-eye={!showInPlainText}
                class:icon-eye-off={showInPlainText}
                aria-hidden="true" />
        </button>
    </div>
</FormItem>
