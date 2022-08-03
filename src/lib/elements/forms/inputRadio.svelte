<script lang="ts">
    import { FormItem, Helper } from '.';

    export let label: string;
    export let showLabel = true;
    export let id: string;
    export let group: string;
    export let value: string;
    export let name: string;
    export let required = false;
    export let disabled = false;
    export let errorMessage = 'An error occurred';
    export let errorType: false | 'success' | 'warning' | 'error' = 'warning';
    export let showHelper = false;

    const handleInvalid = (event: Event) => {
        event.preventDefault();
        showHelper = true;
    };

    $: if (value) {
        showHelper = false;
    }
</script>

<FormItem>
    <div class="input-text-wrapper">
        <input
            on:invalid={handleInvalid}
            {id}
            {name}
            {disabled}
            {required}
            {value}
            type="radio"
            bind:group />
        <label class:u-hide={!showLabel} class="label" for={id}>{label}</label>
    </div>
    {#if showHelper}
        <Helper type={errorType}>{errorMessage}</Helper>
    {/if}
</FormItem>
