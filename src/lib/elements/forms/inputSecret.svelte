<script lang="ts">
    import { FormItem } from '.';

    export let id: string;
    export let label: string;
    export let showLabel = true;
    export let value = '';
    export let placeholder = '';

    let showInPlainText = false;
</script>

<FormItem>
    <label class:u-hide={!showLabel} class="label" for={id}>{label}</label>
    <div class="input-text-wrapper" style="--amount-of-buttons:1">
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
        <div class="options-list">
            <button
                type="button"
                on:click={() => (showInPlainText = !showInPlainText)}
                class="options-list-button"
                aria-label="show / hide password">
                <span
                    class:icon-eye={!showInPlainText}
                    class:icon-eye-off={showInPlainText}
                    aria-hidden="true" />
            </button>
        </div>
    </div>
</FormItem>
